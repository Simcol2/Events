-- OPTIONAL EXAMPLES ONLY.
-- Review exact item names in public.items before running.
-- replacement_value is text in this project, so values retain the dollar sign.

update public.items
set
  brand = 'Staub',
  material = 'Ceramic',
  size = '20 × 16 cm · 1 L',
  feature_highlights = array[
    'Oven safe',
    'Durable glazed finish',
    'Oven-to-table',
    'Family-style serving'
  ],
  details = E'Premium Staub ceramic serveware\nGlossy deep red exterior with cream interior\nDesigned for baking and serving in the same dish\nIdeal for baked pasta, vegetables, stuffing and side dishes\nWorks beautifully with dinnerware, linens and centrepieces',
  care_instructions = E'Allow the dish to cool before washing.\nAvoid sudden temperature changes.\nReturn clean and free of food residue.',
  ideas = E'Use it for baked pasta, roasted vegetables, stuffing or warm side dishes.\nFor family-style service, place one or more serving dishes down the centre of the table.',
  replacement_value = '$45'
where lower(name) like '%staub%'
  and lower(name) like '%rectangular%';

update public.items
set
  brand = 'Staub',
  material = 'Ceramic',
  size = '28 cm / 11 in diameter',
  feature_highlights = array[
    'Oven safe',
    'Durable glazed finish',
    'Fluted pie edge',
    'Oven-to-table'
  ],
  details = E'Classic Staub ceramic pie dish\nCherry red exterior with cream glazed interior\nFluted edge creates a polished presentation\nIdeal for pies, cobblers, quiches, baked dips and desserts\nDesigned to move beautifully from oven to table',
  care_instructions = E'Allow the dish to cool before washing.\nAvoid sudden temperature changes.\nReturn clean and free of food residue.',
  ideas = E'Use it for pies, cobblers, quiche, baked dips or warm desserts.\nIt also works as a low-profile serving dish on a dessert or brunch table.',
  replacement_value = '$65'
where lower(name) like '%staub%'
  and lower(name) like '%pie%';