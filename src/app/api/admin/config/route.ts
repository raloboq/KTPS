/*import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Obtener fases
    const phasesResult = await sql`
      SELECT phase_id, name, duration, instructions
      FROM phase_config
      ORDER BY id;
    `;

    // Obtener prompt del sistema
    const promptResult = await sql`
      SELECT prompt
      FROM system_prompts
      ORDER BY id DESC
      LIMIT 1;
    `;

    return NextResponse.json({
      phases: phasesResult.rows,
      systemPrompt: promptResult.rows[0] || { prompt: '' }
    });
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { phases, systemPrompt } = await request.json();

    // Validar que los datos necesarios estén presentes
    if (!Array.isArray(phases) || !phases.length) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Datos de fases inválidos'
        },
        { status: 400 }
      );
    }

    // Validar cada fase
    for (const phase of phases) {
      if (!phase.id || !phase.name || phase.duration === undefined || !phase.instructions) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Datos incompletos en una o más fases'
          },
          { status: 400 }
        );
      }
    }

    // Iniciar una transacción
    await sql`BEGIN`;

    try {
      // Eliminar configuración anterior de fases
      await sql`DELETE FROM phase_config`;

      // Insertar nuevas fases
      for (const phase of phases) {
        await sql`
          INSERT INTO phase_config 
          (phase_id, name, duration, instructions)
          VALUES 
          (${phase.id}, ${phase.name}, ${phase.duration}, ${phase.instructions});
        `;
      }

      // Actualizar el prompt del sistema
      await sql`DELETE FROM system_prompts`;
      
      if (systemPrompt && systemPrompt.prompt) {
        await sql`
          INSERT INTO system_prompts (prompt)
          VALUES (${systemPrompt.prompt});
        `;
      }

      // Confirmar la transacción
      await sql`COMMIT`;

      return NextResponse.json({ 
        success: true,
        message: 'Configuración guardada exitosamente'
      });

    } catch (error) {
      // Si hay error, revertir los cambios
      await sql`ROLLBACK`;
      throw error;
    }

  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al guardar la configuración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}*/
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET: Obtener la configuración actual
export async function GET() {
  try {
    // Obtener fases
    const phasesResult = await sql`
      SELECT phase_id, name, duration, instructions
      FROM phase_config
      ORDER BY phase_id;
    `;

    // Obtener prompt del sistema
    const promptResult = await sql`
      SELECT prompt
      FROM system_prompts
      ORDER BY id DESC
      LIMIT 1;
    `;

    return NextResponse.json({
      phases: phasesResult.rows.map(row => ({
        id: row.phase_id,
        name: row.name,
        duration: row.duration,
        instructions: row.instructions
      })),
      systemPrompt: promptResult.rows[0] || { prompt: '' }
    });
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

// POST: Guardar o actualizar la configuración
export async function POST(request: Request) {
  try {
    const { phases, systemPrompt } = await request.json();

    // Validar que los datos necesarios estén presentes
    if (!Array.isArray(phases) || phases.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron datos de fases' },
        { status: 400 }
      );
    }

    // Validar cada fase
    for (const phase of phases) {
      if (!phase.id || !phase.name || !phase.duration || !phase.instructions) {
        return NextResponse.json(
          { error: 'Datos incompletos en una o más fases' },
          { status: 400 }
        );
      }
    }

    // Iniciar una transacción
    await sql`BEGIN`;

    try {
      // Actualizar cada fase
      for (const phase of phases) {
        // Intentar actualizar primero
        const updateResult = await sql`
          UPDATE phase_config 
          SET 
            name = ${phase.name},
            duration = ${phase.duration},
            instructions = ${phase.instructions}
          WHERE phase_id = ${phase.id}
          RETURNING *;
        `;

        // Si no existe la fase, insertarla
        if (updateResult.rowCount === 0) {
          await sql`
            INSERT INTO phase_config (phase_id, name, duration, instructions)
            VALUES (${phase.id}, ${phase.name}, ${phase.duration}, ${phase.instructions});
          `;
        }
      }

      // Actualizar el prompt del sistema
      if (systemPrompt && systemPrompt.prompt) {
        const updatePromptResult = await sql`
          UPDATE system_prompts 
          SET prompt = ${systemPrompt.prompt}
          WHERE id = (SELECT id FROM system_prompts ORDER BY id DESC LIMIT 1)
          RETURNING *;
        `;

        // Si no existe un prompt, crear uno nuevo
        if (updatePromptResult.rowCount === 0) {
          await sql`
            INSERT INTO system_prompts (prompt)
            VALUES (${systemPrompt.prompt});
          `;
        }
      }

      // Confirmar la transacción
      await sql`COMMIT`;

      return NextResponse.json({
        success: true,
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      // Si hay error, revertir los cambios
      await sql`ROLLBACK`;
      throw error;
    }

  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al guardar la configuración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}