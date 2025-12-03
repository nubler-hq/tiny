/**
 * Popula dados de demonstração na organização recém criada
 */
export async function createDemoDataForOrganization(
  organizationId: string,
  context: any,
) {
  const firstNames = [
    'Lucas',
    'Ana',
    'Rafael',
    'Mariana',
    'Fernando',
    'Juliana',
    'Bruno',
    'Camila',
    'Pedro',
    'Luiza',
  ]
  const lastNames = [
    'Silva',
    'Souza',
    'Oliveira',
    'Lima',
    'Barbosa',
    'Almeida',
    'Pereira',
    'Ferreira',
  ]
  const domain = 'demo.com'
  const now = new Date()

  // Gera 10 leads com datas nos últimos 7 dias
  for (let i = 0; i < 10; i++) {
    const dayOffset = Math.floor(Math.random() * 7) // de hoje até 6 dias atrás
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - dayOffset)
    createdAt.setHours(
      Math.floor(Math.random() * 12) + 8,
      Math.floor(Math.random() * 60),
      0,
      0,
    ) // Entre 8h e 20h

    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
    const email = `${name.toLowerCase().replace(/ /g, '.')}@${domain}`
    const phone = `11 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`

    const lead = await context.services.database.lead.create({
      data: {
        organizationId,
        name,
        email,
        phone,
        metadata: JSON.stringify({ origindemo: true }),
        createdAt,
        updatedAt: createdAt,
      },
    })

    // 0-3 submissions para o lead
    const nSubmissions = Math.floor(Math.random() * 4)

    for (let s = 0; s < nSubmissions; s++) {
      // Distribuir a submission +- algumas horas depois do lead
      const submissionDate = new Date(
        createdAt.getTime() + Math.random() * 60 * 60 * 1000 * 12,
      )
      await context.services.database.submission.create({
        data: {
          organizationId,
          leadId: lead.id,
          metadata: JSON.stringify({ demo: true }),
          createdAt: submissionDate,
          updatedAt: submissionDate,
        },
      })
    }
  }
}
