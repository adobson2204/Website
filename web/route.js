import sql from "@/app/api/utils/sql";

// GET - List appointments with optional filtering
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaign_id');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    let query = `
      SELECT 
        a.*,
        c.name as campaign_name
      FROM appointments a
      LEFT JOIN campaigns c ON a.campaign_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (campaignId) {
      query += ` AND a.campaign_id = $${paramCount}`;
      values.push(campaignId);
      paramCount++;
    }

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY a.scheduled_for ASC LIMIT $${paramCount}`;
    values.push(limit);

    const appointments = await sql(query, values);

    return Response.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return Response.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST - Create new appointment
export async function POST(request) {
  try {
    const body = await request.json();
    const { campaign_id, customer_name, phone, scheduled_for, agent_name, notes } = body;

    if (!customer_name || !phone || !scheduled_for) {
      return Response.json({ 
        error: 'Customer name, phone, and scheduled time are required' 
      }, { status: 400 });
    }

    const [appointment] = await sql`
      INSERT INTO appointments (campaign_id, customer_name, phone, scheduled_for, agent_name, notes)
      VALUES (${campaign_id || null}, ${customer_name}, ${phone}, ${scheduled_for}, ${agent_name || null}, ${notes || null})
      RETURNING *
    `;

    // Update campaign appointment count if campaign_id provided
    if (campaign_id) {
      await sql`
        UPDATE campaigns 
        SET appointments_booked = appointments_booked + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${campaign_id}
      `;
    }

    return Response.json({ appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return Response.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
