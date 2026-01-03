"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const defaultCategories = [
    { name: 'Hogar', icon: '🏠', color: '#8B5CF6' },
    { name: 'Servicios', icon: '⚡', color: '#F59E0B' },
    { name: 'Supermercado', icon: '🛒', color: '#10B981' },
    { name: 'Transporte', icon: '🚗', color: '#3B82F6' },
    { name: 'Ropa', icon: '👕', color: '#EC4899' },
    { name: 'Entretenimiento', icon: '🎉', color: '#F97316' },
    { name: 'Salud', icon: '💊', color: '#EF4444' },
    { name: 'Educación', icon: '📚', color: '#6366F1' },
    { name: 'Tarjeta', icon: '💳', color: '#14B8A6' },
    { name: 'Restaurantes', icon: '🍽️', color: '#D946EF' },
    { name: 'Suscripciones', icon: '📱', color: '#0EA5E9' },
    { name: 'Mascotas', icon: '🐾', color: '#A855F7' },
    { name: 'Ahorro', icon: '🐷', color: '#22C55E' },
    { name: 'Otros', icon: '📦', color: '#6B7280' },
];
async function main() {
    console.log('🌱 Seeding database...');
    console.log('📁 Creating default expense categories...');
    for (const category of defaultCategories) {
        await prisma.expenseCategory.upsert({
            where: {
                id: category.name.toLowerCase().replace(/\s+/g, '-'),
            },
            update: {
                name: category.name,
                icon: category.icon,
                color: category.color,
                isDefault: true,
            },
            create: {
                id: category.name.toLowerCase().replace(/\s+/g, '-'),
                name: category.name,
                icon: category.icon,
                color: category.color,
                isDefault: true,
            },
        });
        console.log(`  ✅ ${category.icon} ${category.name}`);
    }
    console.log('');
    console.log('✨ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map