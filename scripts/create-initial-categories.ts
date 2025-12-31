import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import Category from '@/models/Category'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local')
  process.exit(1)
}

const initialCategories = [
  {
    name: 'Laptops',
    nameFr: 'Ordinateurs Portables',
    nameAr: 'أجهزة الكمبيوتر المحمولة',
    slug: 'laptops',
    description: 'Laptops and portable computers',
    descriptionFr: 'Ordinateurs portables et portables',
    descriptionAr: 'أجهزة الكمبيوتر المحمولة والكمبيوتر المحمول',
    icon: '/icons/laptop.svg',
    order: 1,
    isActive: true,
  },
  {
    name: 'Desktops',
    nameFr: 'Ordinateurs de Bureau',
    nameAr: 'أجهزة الكمبيوتر المكتبية',
    slug: 'desktops',
    description: 'Desktop computers and workstations',
    descriptionFr: 'Ordinateurs de bureau et stations de travail',
    descriptionAr: 'أجهزة الكمبيوتر المكتبية ومحطات العمل',
    icon: '/icons/computer.svg',
    order: 2,
    isActive: true,
  },
  {
    name: 'Monitors',
    nameFr: 'Écrans',
    nameAr: 'الشاشات',
    slug: 'monitors',
    description: 'Computer monitors and displays',
    descriptionFr: 'Moniteurs et écrans d\'ordinateur',
    descriptionAr: 'شاشات الكمبيوتر والعروض',
    icon: '/icons/monitor.svg',
    order: 3,
    isActive: true,
  },
  {
    name: 'Gaming',
    nameFr: 'Gaming',
    nameAr: 'الألعاب',
    slug: 'gaming',
    description: 'Gaming computers and accessories',
    descriptionFr: 'Ordinateurs et accessoires de jeu',
    descriptionAr: 'أجهزة الكمبيوتر والألعاب والإكسسوارات',
    icon: '/icons/game-controller.svg',
    order: 4,
    isActive: true,
  },
  {
    name: 'Accessories',
    nameFr: 'Accessoires',
    nameAr: 'الإكسسوارات',
    slug: 'accessories',
    description: 'Computer accessories and peripherals',
    descriptionFr: 'Accessoires et périphériques informatiques',
    descriptionAr: 'إكسسوارات الكمبيوتر والملحقات',
    icon: '/icons/computer-keyboard.svg',
    order: 5,
    isActive: true,
  },
  {
    name: 'Packs',
    nameFr: 'Packs',
    nameAr: 'الباقات',
    slug: 'packs',
    description: 'Product bundles and packages',
    descriptionFr: 'Ensembles et packages de produits',
    descriptionAr: 'حزم المنتجات والحزم',
    icon: '/icons/game-controller.svg',
    order: 6,
    isActive: true,
  },
]

async function createInitialCategories() {
  try {
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected to MongoDB')

    for (const categoryData of initialCategories) {
      const existing = await Category.findOne({ slug: categoryData.slug })
      if (existing) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`)
        continue
      }

      const category = await Category.create(categoryData)
      console.log(`Created category: ${category.name} (${category.slug})`)
    }

    console.log('Initial categories created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error creating categories:', error)
    process.exit(1)
  }
}

createInitialCategories()

