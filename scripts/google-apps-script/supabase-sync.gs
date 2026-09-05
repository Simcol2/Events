/**
 * A Slice of G Events — Google Sheets to Supabase sync.
 *
 * Keeps two Supabase tables in sync with two sheets in this spreadsheet:
 *   "Decor Items"  -> public.items
 *   "Experiences"  -> public.experiences
 *
 * Rows are matched by "name" (each table has a unique constraint on it —
 * see the setup SQL). id is left alone entirely: Postgres assigns it
 * automatically on insert, however that column is typed in your table.
 *
 * This is a STANDALONE script (created from script.google.com, not from
 * Extensions > Apps Script inside a sheet), so it isn't automatically tied
 * to any spreadsheet — SHEET_URL below tells it which one to use.
 *
 * This is a REFERENCE COPY for version control. The live, editable script
 * lives at script.google.com (open it from the spreadsheet's Extensions
 * menu, or from script.google.com directly if it's a standalone project).
 * Editing this file in the repo does nothing on its own; copy any changes
 * over to the live script manually, and copy the live script back here
 * (with SUPABASE_SERVICE_ROLE_KEY blanked out before committing) whenever
 * it changes, so this stays a true reference instead of going stale.
 *
 * ANY TIME A COLUMN IS ADDED TO public.items OR public.experiences IN
 * SUPABASE (a new alter table ... add column ...), it also needs to be
 * added as a header in the matching sheet's header row before the sync
 * will pick it up, see SETUP step 1 below and the header-matching note
 * further down. Adding the column in Supabase alone is not enough.
 *
 * SETUP (one time):
 * 1. Fill in SHEET_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY below
 *    with your real values, then save (the disk icon).
 *    - SHEET_URL: open your Google Sheet and copy the URL from the address
 *      bar — the whole thing, e.g. https://docs.google.com/spreadsheets/d/XXXXXXXXXXXX/edit
 *    - SUPABASE_URL: Supabase > Project Settings > API > Project URL
 *      (looks like https://xxxx.supabase.co — NOT the dashboard URL).
 *    - SUPABASE_SERVICE_ROLE_KEY: same API settings page — use the SERVICE
 *      ROLE key, not the anon key, since writes need to bypass RLS.
 * 2. At the top of the editor there's a function picker dropdown next to the
 *    Run button (▶). Select "installTrigger", then tap Run. The first time,
 *    Google will show an authorization screen — tap Review Permissions,
 *    pick your account, tap Advanced > Go to (project name), then Allow.
 *    This installs the trigger that watches every edit on that sheet and
 *    pushes it to Supabase automatically from then on.
 * 3. Still in that function picker: select "syncDecorItemsNow" and tap Run,
 *    then select "syncExperiencesNow" and tap Run. That pushes everything
 *    currently in both sheets to Supabase for the first time.
 *
 * HOW IT WORKS AFTER SETUP:
 * Editing any data cell in "Decor Items" or "Experiences" on that sheet
 * pushes just that row to Supabase within a second or two, matched to the
 * existing row (if any) by its "name" value.
 *
 * ADDING A COLUMN LATER (e.g. variant_group / variant_label):
 * Both syncRow_() (sheet -> Supabase) and pullSheetFromSupabase_()
 * (Supabase -> sheet) work from whatever is already typed in the sheet's
 * header row; they never invent a new column on either side. So after
 * running `alter table ... add column ...` in Supabase, also type the
 * exact same column name into the header row of the matching sheet
 * (spelled identically, since that text is sent straight through as the
 * Supabase column name). Only then will a "Pull from Supabase" or an edit
 * to that column actually sync it.
 */

// ── Fill these in, then save the file ──────────────────────────────
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1bwge3-UI3JoYUBOBx9Og7hj6siATctuYnkq6fHsl2W4/edit?gid=1846433607#gid=1846433607";
const SUPABASE_URL = "https://rsexseihtkaqoxccrylk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "paste-your-service-role-key-here";

const SHEET_CONFIG = {
  "Decor Items": { table: "items", headerRow: 4 },
  "Experiences": { table: "experiences", headerRow: 4 },
};

const JSON_COLUMNS = ["photos"]; // columns whose cell text is a JSON array string
const SKIP_COLUMNS = ["id"]; // columns that exist in the sheet but are never sent to Supabase
const ARRAY_COLUMNS = ["tags"]; // columns whose cell text is a comma-separated list

function getSpreadsheet_() {
  if (!SHEET_URL || SHEET_URL.indexOf("PASTE_YOUR_SHEET_ID_HERE") !== -1) {
    throw new Error("SHEET_URL is still the placeholder — edit it at the top of Code.gs and save.");
  }
  return SpreadsheetApp.openByUrl(SHEET_URL);
}

// ── One-time setup, run from the Apps Script editor's function picker ──

function installTrigger() {
  const ss = getSpreadsheet_();

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "onEditInstallable_") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("onEditInstallable_")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log("Auto-sync trigger installed. Edits to Decor Items or Experiences now push to Supabase automatically.");
}

function syncDecorItemsNow() {
  syncSheetByName_("Decor Items");
}

function syncExperiencesNow() {
  syncSheetByName_("Experiences");
}

function syncSheetByName_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  const config = SHEET_CONFIG[sheetName];
  if (!sheet || !config) {
    Logger.log('Sheet "' + sheetName + '" not found.');
    return;
  }
  const headerRow = config.headerRow;
  const lastRow = sheet.getLastRow();
  let synced = 0;
  for (let r = headerRow + 1; r <= lastRow; r++) {
    const name = sheet.getRange(r, headerIndex_(sheet, headerRow, "name")).getValue();
    if (!name) continue; // skip blank rows
    if (String(name).indexOf("EXAMPLE") === 0) continue; // skip the sample row
    syncRow_(sheet, config, headerRow, r);
    synced++;
  }
  Logger.log("Synced " + synced + ' row(s) from "' + sheetName + '" to Supabase.');
}

// ── Trigger entry point (fires automatically after installTrigger runs) ──

function onEditInstallable_(e) {
  try {
    const sheet = e.range.getSheet();
    const config = SHEET_CONFIG[sheet.getName()];
    if (!config) return; // edit was on some other sheet, ignore

    const headerRow = config.headerRow;
    const editedRow = e.range.getRow();
    if (editedRow <= headerRow) return; // title/legend/header rows, ignore

    const firstRow = editedRow;
    const lastRow = editedRow + e.range.getNumRows() - 1;
    for (let r = firstRow; r <= lastRow; r++) {
      syncRow_(sheet, config, headerRow, r);
    }
  } catch (err) {
    Logger.log("Supabase sync failed: " + err.message);
  }
}

// ── Core sync logic ───────────────────────────────────────────────

function syncRow_(sheet, config, headerRow, row) {
  const headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];

  const nameIdx = headers.indexOf("name");
  if (nameIdx === -1 || !values[nameIdx]) return; // nothing to sync yet
  if (String(values[nameIdx]).indexOf("EXAMPLE") === 0) return; // sample row, never sync

  const idIdx = headers.indexOf("id");
  const existingId = idIdx !== -1 && values[idIdx] !== "" ? values[idIdx] : null;

  const record = {};
  headers.forEach(function (header, i) {
    if (!header) return;
    if (SKIP_COLUMNS.indexOf(header) !== -1) return; // id is handled separately below

    let val = values[i];
    if (val === "") val = null;

    if (JSON_COLUMNS.indexOf(header) !== -1) {
      if (val === null || val === undefined) {
        val = null;
      } else {
        try {
          val = JSON.parse(val);
        } catch (parseErr) {
          throw new Error('Row ' + row + ': "' + header + '" isn\'t valid JSON: ' + val);
        }
      }
    } else if (ARRAY_COLUMNS.indexOf(header) !== -1) {
      val = val === null || val === undefined || val === ""
        ? []
        : String(val).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    } else if (val instanceof Date) {
      val = val.toISOString();
    }
    record[header] = val;
  });

  const newId = upsert_(config.table, record, existingId);
  if (newId && idIdx !== -1 && !existingId) {
    sheet.getRange(row, idIdx + 1).setValue(newId);
  }
}

function upsert_(table, record, existingId) {
    if (!SUPABASE_URL || SUPABASE_URL.indexOf("your-project") !== -1) {
      throw new Error("SUPABASE_URL is still the placeholder - edit it at the top of Code.gs and save.");
    }
    if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.indexOf("paste-your") !== -1) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is still the placeholder - edit it at the top of Code.gs and save.");
    }

    // A blank photo cell in the sheet means "no photo entered here", not
    // "delete the photo" - omit the key entirely so a photo added directly
    // in Supabase (e.g. via the admin tool) survives the next sync instead
    // of being wiped back to null.
    if ("photos" in record && isBlankPhotos_(record.photos)) {
      delete record.photos;
    }

    const base = SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + table;
    if (existingId) {
      // Known row - update it by id directly, so renaming "name" can never
      // be mistaken for a different item.
      const endpoint = base + "?id=eq." + encodeURIComponent(existingId);
      const response = UrlFetchApp.fetch(endpoint, {
        method: "patch",
        contentType: "application/json",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
          Prefer: "return=minimal",
        },
        payload: JSON.stringify(record),
        muteHttpExceptions: true,
      });
      const code = response.getResponseCode();
      if (code < 200 || code >= 300) {
        throw new Error("Supabase " + code + ": " + response.getContentText());
      }
      return null;
    }

    // New row - insert it. on_conflict=name is only a safety net for an
    // accidental duplicate name; the normal path for an existing row is the
    // id-based PATCH above. return=representation so the new id can be
    // written back into the sheet.
    const endpoint = base + "?on_conflict=name";
    const response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      payload: JSON.stringify([record]),
      muteHttpExceptions: true,
    });
    const code = response.getResponseCode();
    if (code < 200 || code >= 300) {
      throw new Error("Supabase " + code + ": " + response.getContentText());
    }
    const rows = JSON.parse(response.getContentText());
    return rows && rows[0] ? rows[0].id : null;
  }

  function isBlankPhotos_(photos) {
    if (photos === null || photos === undefined || photos === "") return true;
    if (Array.isArray(photos) && photos.length === 0) return true;
    return false;
  }
function headerIndex_(sheet, headerRow, name) {
  const headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx = headers.indexOf(name);
  if (idx === -1) throw new Error('Column "' + name + '" not found in header row ' + headerRow);
  return idx + 1; // 1-based for Range APIs
}

function pullFromSupabase() {
  pullSheetFromSupabase_("Decor Items");
  pullSheetFromSupabase_("Experiences");
}

function pullSheetFromSupabase_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  const config = SHEET_CONFIG[sheetName];
  if (!sheet || !config) {
    Logger.log('Sheet "' + sheetName + '" not found.');
    return;
  }
  const headerRow = config.headerRow;
  const headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];

  const endpoint = SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + config.table + "?select=*&order=name.asc";
  const response = UrlFetchApp.fetch(endpoint, {
    method: "get",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    },
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error("Supabase " + code + ": " + response.getContentText());
  }
  const rows = JSON.parse(response.getContentText());

  const lastRow = sheet.getLastRow();
  if (lastRow > headerRow) {
    sheet.getRange(headerRow + 1, 1, lastRow - headerRow, headers.length).clearContent();
  }

  const outRows = rows.map(function (record) {
    return headers.map(function (header) {
      if (!header) return "";
      const val = record[header];
      if (val === null || val === undefined) return "";
      if (JSON_COLUMNS.indexOf(header) !== -1) return JSON.stringify(val);
      if (ARRAY_COLUMNS.indexOf(header) !== -1) return Array.isArray(val) ? val.join(", ") : val;
      return val;
    });
  });

  if (outRows.length) {
    sheet.getRange(headerRow + 1, 1, outRows.length, headers.length).setValues(outRows);
  }

  Logger.log("Pulled " + outRows.length + ' row(s) from Supabase into "' + sheetName + '".');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Supabase Sync')
    .addItem('Sync Decor Items', 'syncDecorItemsNow')
    .addItem('Sync Experiences', 'syncExperiencesNow')
    .addSeparator()
    .addItem('Pull from Supabase', 'pullFromSupabase')
    .addToUi();
}

function setupMenuTrigger() {
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.openById('1bwge3-UI3JoYUBOBx9Og7hj6siATctuYnkq6fHsl2W4'))
    .onOpen()
    .create();
}
