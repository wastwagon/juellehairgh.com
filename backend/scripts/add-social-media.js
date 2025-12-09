const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSocialMedia() {
  try {
    await prisma.setting.upsert({
      where: { key: 'SOCIAL_FACEBOOK' },
      update: { value: 'https://facebook.com/juellehairgh', category: 'social' },
      create: { key: 'SOCIAL_FACEBOOK', value: 'https://facebook.com/juellehairgh', category: 'social' }
    });
    
    await prisma.setting.upsert({
      where: { key: 'SOCIAL_INSTAGRAM' },
      update: { value: 'https://instagram.com/juellehairgh', category: 'social' },
      create: { key: 'SOCIAL_INSTAGRAM', value: 'https://instagram.com/juellehairgh', category: 'social' }
    });
    
    await prisma.setting.upsert({
      where: { key: 'SOCIAL_TWITTER' },
      update: { value: 'https://twitter.com/juellehairgh', category: 'social' },
      create: { key: 'SOCIAL_TWITTER', value: 'https://twitter.com/juellehairgh', category: 'social' }
    });
    
    console.log('✅ Social media settings added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSocialMedia();
