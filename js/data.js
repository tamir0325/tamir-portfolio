/*
 * data.js — "өгөгдлийн сан" маань.
 * Сайт дээрх бүх мэдээлэл энд л байна. Хүснэгт бүр нь объектуудын массив.
 * Шинэ бүтээл нэмэх бол projects массивт нэг мөр нэмэхэд л болно.
 */
const DB = {
  me: [
    {
      name: 'Баасанжав Тамир',
      role: 'Мэдээллийн системийн менежмент · Backend & Data',
      motto: 'Өгөгдлөөс утга, кодоос үнэ цэн бүтээнэ.',
    },
  ],

  about: [
    { field: 'намтар', value: 'СЭЗИС-ийн Мэдээллийн системийн менежментийн 4-р курсын оюутан. Backend, өгөгдлийн сан, аналитикийн чиглэлээр хөгжиж байна.' },
    { field: 'сургууль', value: 'Санхүү, эдийн засгийн их сургууль (СЭЗИС)' },
    { field: 'мэргэжил', value: 'Мэдээллийн системийн менежмент, 4-р курс' },
    { field: 'дадлага', value: 'Герэгэ Системс ХХК — C# хөгжүүлэлт, Oracle SQL' },
    { field: 'сонирхол', value: 'Backend систем, өгөгдлийн дүн шинжилгээ, машин сургалт' },
    { field: 'байршил', value: 'Улаанбаатар, Монгол' },
    { field: 'хэл', value: 'Монгол, Англи' },
  ],

  // level: өөрийн үнэлгээ (0–100). Хүссэнээрээ засаарай.
  skills: [
    { name: 'Oracle SQL', category: 'database', level: 85 },
    { name: 'PostgreSQL / Supabase', category: 'database', level: 75 },
    { name: 'C# / .NET', category: 'backend', level: 75 },
    { name: 'Node.js', category: 'backend', level: 65 },
    { name: 'JavaScript', category: 'frontend', level: 80 },
    { name: 'React', category: 'frontend', level: 70 },
    { name: 'HTML / CSS', category: 'frontend', level: 85 },
    { name: 'Python', category: 'data', level: 75 },
    { name: 'Apache Superset', category: 'data', level: 80 },
    { name: 'PyTorch', category: 'data', level: 60 },
    { name: 'Git / GitHub', category: 'tools', level: 80 },
  ],

  projects: [
    {
      id: 1,
      title: 'Steppe Horse',
      year: 2026,
      type: 'Вэбсайт',
      description: 'Steppe Horse Travel аялал жуулчлалын компанийн вэбсайт: чиглэлүүд, аяллын багц, захиалгын форм. SWE334 хичээлийн бие даалт.',
      stack: ['React', 'Supabase', 'Payment API'],
      image: 'assets/projects/steppe-horse.svg',
      link: 'https://steppe-hhvd.vercel.app',
    },
    {
      id: 2,
      title: 'ISM Digital Museum',
      year: 2026,
      type: 'Вэб апп',
      description: 'Мэдээллийн системийн менежментийн тэнхимийн түүх, бүтээлүүдийг харуулах дижитал музей.',
      stack: ['Vite', 'JavaScript'],
      image: 'assets/projects/museum.svg',
      link: 'https://ism-digital-museum-taupe.vercel.app',
    },
    {
      id: 3,
      title: 'Luna·nara Coffee',
      year: 2026,
      type: 'Мобайл меню',
      description: 'Luna·nara Coffee & Craft кофе шопын гар утсанд зориулсан цахим меню.',
      stack: ['HTML', 'CSS', 'JavaScript'],
      image: 'assets/projects/lunanara.svg',
      link: 'https://lunanara-menu.vercel.app',
    },
    {
      id: 4,
      title: 'TripHub',
      year: 2026,
      type: 'Стартап',
      description: 'Аялагчдыг аяллын үйлчилгээ үзүүлэгчидтэй холбох платформ. Багийн техникийн ахлагчаар ажилласан (ISA334).',
      stack: ['React', 'Node.js', 'PostgreSQL'],
      image: 'assets/projects/triphub.svg',
      link: 'https://github.com/tamir0325',
    },
    {
      id: 5,
      title: 'Аналитик самбар',
      year: 2025,
      type: 'Data',
      description: 'Apache Superset ашиглан бизнесийн үзүүлэлтүүдийг бодит хугацаанд харуулах dashboard-ууд.',
      stack: ['Apache Superset', 'SQL', 'Python'],
      image: 'assets/projects/dashboards.svg',
      link: 'https://github.com/tamir0325',
    },
    {
      id: 6,
      title: 'Герэгэ Системс — дадлага',
      year: 2025,
      type: 'Дадлага',
      description: 'C# дээр бизнесийн логик хөгжүүлж, Oracle өгөгдлийн сангийн query, procedure бичсэн.',
      stack: ['C#', '.NET', 'Oracle SQL'],
      image: 'assets/projects/gerege.svg',
      link: 'https://github.com/tamir0325',
    },
    {
      id: 7,
      title: 'Машин сургалтын төсөл',
      year: 2025,
      type: 'ML',
      description: 'PyTorch ашиглан neural network сургаж, үр дүнг шинжилсэн хичээлийн ажил.',
      stack: ['Python', 'PyTorch'],
      image: 'assets/projects/ml.svg',
      link: 'https://github.com/tamir0325',
    },
  ],

  contact: [
    { channel: 'email', handle: 'tamirbaasanjav4@gmail.com', url: 'mailto:tamirbaasanjav4@gmail.com' },
    { channel: 'github', handle: 'tamir0325', url: 'https://github.com/tamir0325' },
    { channel: 'linkedin', handle: 'tamir-baasanjav', url: 'https://www.linkedin.com/in/tamir-baasanjav-5088a11b1' },
  ],
};
