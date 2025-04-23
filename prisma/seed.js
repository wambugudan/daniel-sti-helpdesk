const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create Users
  await prisma.user.createMany({
    data: [
      { id: 'user-council-01', name: 'Alice Muthoni', email: 'alice.muthoni@gov.ke', role: 'COUNCIL' },
      { id: 'user-council-02', name: 'Samuel Otieno', email: 'samuel.otieno@gov.ke', role: 'COUNCIL' },
      { id: 'user-council-03', name: 'Beatrice Wanja', email: 'beatrice.wanja@gov.ke', role: 'COUNCIL' },
      { id: 'user-council-04', name: 'David Kamau', email: 'david.kamau@gov.ke', role: 'COUNCIL' },
      { id: 'user-expert-01', name: 'Jane Mwikali', email: 'jane.mwikali@freelance.co.ke', role: 'EXPERT' },
      { id: 'user-expert-02', name: 'Tom Barasa', email: 'tom.barasa@devhub.co.ke', role: 'EXPERT' },
      { id: 'user-expert-03', name: 'Lilian Chebet', email: 'lilian.chebet@translator.net', role: 'EXPERT' },
    ],
  });

  // 2. Create Work Requests
  await prisma.workRequest.createMany({
    data: [
      {
        id: 'wr-001',
        title: 'Design a Logo for Municipal Recycling Program',
        budget: '2000',
        description: 'Looking for a professional logo design to represent the city\'s new recycling initiative.',
        category: 'Graphic Design',
        userId: 'user-council-01',
        createdAt: new Date('2025-04-01T10:00:00Z'),
        updatedAt: new Date('2025-04-01T10:00:00Z'),
        deadline: new Date('2025-04-10T00:00:00Z'),
        durationDays: 9,
      },
      {
        id: 'wr-002',
        title: 'Develop a Mobile App for Public Transport Alerts',
        budget: '1500',
        description: 'We need an Android and iOS app to send real-time alerts and notifications to commuters in Nairobi.',
        category: 'App Development',
        fileURL: 'https://example.com/specs.pdf',
        userId: 'user-council-02',
        createdAt: new Date('2025-03-30T12:15:00Z'),
        updatedAt: new Date('2025-03-30T12:15:00Z'),
        deadline: new Date('2025-04-20T00:00:00Z'),
        durationDays: 21,
      },
      {
        id: 'wr-003',
        title: 'Translation of Health Brochures into Kiswahili',
        budget: '3000',
        description: 'Translate 15 pages of health education material from English to Kiswahili, maintaining technical accuracy.',
        category: 'Translation',
        userId: 'user-council-03',
        createdAt: new Date('2025-04-02T08:30:00Z'),
        updatedAt: new Date('2025-04-02T08:30:00Z'),
        deadline: new Date('2025-04-12T00:00:00Z'),
        durationDays: 10,
      },
      {
        id: 'wr-004',
        title: 'Create an Awareness Video on Sanitation',
        budget: '1000',
        description: 'Produce a 2-minute awareness video to promote good sanitation practices in informal settlements.',
        category: 'Video Production',
        fileURL: 'https://example.com/video-brief.docx',
        userId: 'user-council-01',
        createdAt: new Date('2025-03-28T14:45:00Z'),
        updatedAt: new Date('2025-03-28T14:45:00Z'),
        deadline: new Date('2025-04-08T00:00:00Z'),
        durationDays: 11,
      },
      {
        id: 'wr-005',
        title: 'Web Portal for Citizen Feedback',
        budget: '2500',
        description: 'We require a secure web portal where citizens can submit feedback and reports about public services.',
        category: 'Web Development',
        userId: 'user-council-04',
        createdAt: new Date('2025-04-03T09:00:00Z'),
        updatedAt: new Date('2025-04-03T09:00:00Z'),
        deadline: new Date('2025-05-03T00:00:00Z'),
        durationDays: 30,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('✅ Seed data added');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
