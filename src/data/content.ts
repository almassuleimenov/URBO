/** Цены условные — заменить актуальным меню URBO. */

export type MenuItem = { name: string; note: string; price: number };
export type MenuCategory = {
  id: "coffee" | "breakfast" | "bowls";
  label: string;
  lead: string;
  photo: { src: string; width: number; height: number; alt: string; position: string };
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: "coffee",
    label: "Кофе",
    lead: "Классика на эспрессо, фильтр и рафы. Молоко в любом напитке можно заменить на растительное.",
    photo: {
      src: "/assets/img/photo-c141.webp",
      width: 1280,
      height: 853,
      alt: "Бариста вливает молоко в капучино",
      position: "35% 55%",
    },
    items: [
      { name: "Эспрессо", note: "Двойной, 60 мл", price: 990 },
      { name: "Американо", note: "Эспрессо и горячая вода", price: 1190 },
      { name: "Капучино", note: "Эспрессо и молочная пена", price: 1590 },
      { name: "Флэт уайт", note: "Двойной эспрессо, тонкий слой пены", price: 1790 },
      { name: "Раф ванильный", note: "Эспрессо, сливки, ваниль", price: 1890 },
      { name: "Айс-латте", note: "Эспрессо, молоко, лёд", price: 1690 },
    ],
  },
  {
    id: "breakfast",
    label: "Завтраки",
    lead: "Подаём с открытия. Сырники, тосты, омлеты и гранола.",
    photo: {
      src: "/assets/img/food-breakfast.webp",
      width: 1200,
      height: 1701,
      alt: "Тост с авокадо и яйцом на тёмной тарелке",
      position: "50% 45%",
    },
    items: [
      { name: "Сырники", note: "Сметана, ягодный соус", price: 2490 },
      { name: "Тост с авокадо", note: "Яйцо пашот, зелень, чиабатта", price: 2990 },
      { name: "Омлет с лососем", note: "Сливочный сыр, шпинат", price: 3290 },
      { name: "Гранола", note: "Греческий йогурт, мёд, ягоды", price: 1990 },
      { name: "Овсяная каша", note: "Банан, арахисовая паста", price: 1690 },
    ],
  },
  {
    id: "bowls",
    label: "Боулы",
    lead: "Крупа, белок, овощи и соус в одной тарелке. Хватает на полноценный обед.",
    photo: {
      src: "/assets/img/food-bowl.webp",
      width: 1400,
      height: 933,
      alt: "Асаи-боул с ягодами и фруктами",
      position: "40% 50%",
    },
    items: [
      { name: "Боул с курицей терияки", note: "Рис, эдамаме, огурец, кунжут", price: 3490 },
      { name: "Боул с лососем", note: "Киноа, авокадо, соус понзу", price: 4290 },
      { name: "Асаи-боул", note: "Банан, ягоды, гранола, кокос", price: 2990 },
      { name: "Боул с хумусом", note: "Булгур, печёные овощи, тахини", price: 2890 },
    ],
  },
];

export const steps = [
  {
    n: "01",
    title: "Отбор",
    text: "Кофе начинается с зелёного зерна. Его перебирают вручную ещё до обжарки.",
    photo: { src: "/assets/img/photo-m62054123.webp", width: 1280, height: 853, position: "25% 35%" },
    alt: "Рука перебирает зелёные кофейные зёрна",
  },
  {
    n: "02",
    title: "Обжарка",
    text: "После обжарки зерну нужно отлежаться несколько дней, иначе вкус выйдет резким.",
    photo: { src: "/assets/img/photo-m147143943.webp", width: 1920, height: 1280, position: "42% 55%" },
    alt: "Обжаренное зерно высыпается в охлаждающий лоток",
  },
  {
    n: "03",
    title: "Помол",
    text: "Мелем прямо перед приготовлением и плотно утрамбовываем в холдер.",
    photo: { src: "/assets/img/photo-m187311853-1200.webp", width: 1200, height: 800, position: "58% 50%" },
    alt: "Бариста утрамбовывает молотый кофе в холдере",
  },
  {
    n: "04",
    title: "Экстракция",
    text: "Около 30 секунд на двойной эспрессо. Дольше — горчит, быстрее — кислит.",
    photo: { src: "/assets/img/photo-m28989985-1200.webp", width: 1200, height: 857, position: "62% 62%" },
    alt: "Эспрессо стекает в белую чашку",
  },
  {
    n: "05",
    title: "Молоко",
    text: "Для капучино пена гуще, для флэт уайта тоньше. В этом вся разница.",
    photo: { src: "/assets/img/photo-m201752739.webp", width: 1280, height: 1910, position: "40% 55%" },
    alt: "Молоко взбивается в красном питчере",
  },
  {
    n: "06",
    title: "Подача",
    text: "С собой или в зале. Если торопитесь, просто скажите бариста.",
    photo: { src: "/assets/img/photo-m189498721.webp", width: 1280, height: 853, position: "45% 60%" },
    alt: "Поднос с чашками кофе несут вдоль барной стойки",
  },
];

export const INSTAGRAM = "https://www.instagram.com/urbocoffee/";
export const INSTAGRAM_DM = "https://ig.me/m/urbocoffee";
