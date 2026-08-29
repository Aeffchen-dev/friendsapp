const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_sheets/v4';
const SPREADSHEET_ID = '1-5NpzNwUiAsl_BPruHygyUbpO3LHkWr8E08fqkypOcU';

const SHEETS = {
  all: 'Alle Fragen',
  dates: 'Date 2',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const connectionKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    if (!lovableKey || !connectionKey) {
      return new Response(
        JSON.stringify({ error: 'Google Sheets connection is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL(req.url);
    const useDates = url.searchParams.get('dates') === 'true';
    const sheetTitle = useDates ? SHEETS.dates : SHEETS.all;

    // Fetch values + per-row visibility metadata in one call.
    const params = new URLSearchParams({
      includeGridData: 'true',
      fields:
        'sheets(data(rowData(values(formattedValue)),rowMetadata(hiddenByUser,hiddenByFilter)))',
    });
    params.append('ranges', `${sheetTitle}!A1:C1000`);

    const response = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': connectionKey,
        },
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error(`Sheets request failed [${response.status}]: ${details}`);
      return new Response(
        JSON.stringify({ error: 'Sheets request failed', status: response.status, details }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    const grid = data?.sheets?.[0]?.data?.[0] ?? {};
    const rowData: any[] = grid.rowData ?? [];
    const rowMetadata: any[] = grid.rowMetadata ?? [];

    const rows: string[][] = [];
    let hiddenCount = 0;

    rowData.forEach((row, index) => {
      const meta = rowMetadata[index] ?? {};
      if (meta.hiddenByUser || meta.hiddenByFilter) {
        hiddenCount++;
        return; // ignore rows hidden in the spreadsheet
      }
      const cells = (row?.values ?? []).map((cell: any) => (cell?.formattedValue ?? '').toString());
      rows.push(cells);
    });

    console.log(`Loaded ${rows.length} visible rows from "${sheetTitle}" (${hiddenCount} hidden skipped)`);

    return new Response(JSON.stringify({ sheet: sheetTitle, hiddenCount, rows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('fetch-questions failed:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
