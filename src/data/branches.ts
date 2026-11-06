/**
 * ВНИМАНИЕ: данные-заглушки. Сайт urbocoffee.kz не удалось прочитать автоматически,
 * поэтому улицы и районы — правдоподобные, а координаты приблизительные (только для пина).
 * Замените реальными точками URBO: название, улица, район, часы работы, [долгота, широта].
 */

export type City = "Алматы" | "Каскелен";

export type Branch = {
  id: string;
  name: string;
  city: City;
  street: string;
  district: string;
  /** Часы работы по времени Алматы, формат "HH:MM" */
  hours: { open: string; close: string };
  /** [долгота, широта] */
  coords: [number, number];
  tags: string[];
};

export const branches: Branch[] = [
  {
    id: "dostyk",
    name: "URBO Достык",
    city: "Алматы",
    street: "пр. Достык",
    district: "Медеуский район",
    hours: { open: "07:30", close: "23:00" },
    coords: [76.9575, 43.2455],
    tags: ["VIP-комната", "Завтраки"],
  },
  {
    id: "abaya",
    name: "URBO Абая",
    city: "Алматы",
    street: "пр. Абая",
    district: "Бостандыкский район",
    hours: { open: "07:30", close: "23:00" },
    coords: [76.9265, 43.2405],
    tags: ["Завтраки", "Боулы"],
  },
  {
    id: "satpayev",
    name: "URBO Сатпаева",
    city: "Алматы",
    street: "ул. Сатпаева",
    district: "Бостандыкский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.917, 43.2345],
    tags: ["С собой"],
  },
  {
    id: "tole-bi",
    name: "URBO Толе би",
    city: "Алматы",
    street: "ул. Толе би",
    district: "Алмалинский район",
    hours: { open: "07:30", close: "23:00" },
    coords: [76.905, 43.2525],
    tags: ["VIP-комната", "Боулы"],
  },
  {
    id: "al-farabi",
    name: "URBO Аль-Фараби",
    city: "Алматы",
    street: "пр. Аль-Фараби",
    district: "Бостандыкский район",
    hours: { open: "08:00", close: "23:00" },
    coords: [76.928, 43.2175],
    tags: ["Терраса", "Завтраки"],
  },
  {
    id: "zhibek-zholy",
    name: "URBO Жибек жолы",
    city: "Алматы",
    street: "ул. Жибек жолы",
    district: "Алмалинский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.942, 43.26],
    tags: ["С собой"],
  },
  {
    id: "rozybakiev",
    name: "URBO Розыбакиева",
    city: "Алматы",
    street: "ул. Розыбакиева",
    district: "Бостандыкский район",
    hours: { open: "07:30", close: "23:00" },
    coords: [76.895, 43.229],
    tags: ["Завтраки", "Боулы"],
  },
  {
    id: "momyshuly",
    name: "URBO Момышулы",
    city: "Алматы",
    street: "ул. Момышулы",
    district: "Ауэзовский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.841, 43.233],
    tags: ["С собой"],
  },
  {
    id: "raiymbek",
    name: "URBO Райымбека",
    city: "Алматы",
    street: "пр. Райымбека",
    district: "Жетысуский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.91, 43.27],
    tags: ["С собой"],
  },
  {
    id: "kabanbay",
    name: "URBO Кабанбай батыра",
    city: "Алматы",
    street: "ул. Кабанбай батыра",
    district: "Алмалинский район",
    hours: { open: "07:30", close: "23:00" },
    coords: [76.929, 43.251],
    tags: ["VIP-комната", "Завтраки"],
  },
  {
    id: "gagarin",
    name: "URBO Гагарина",
    city: "Алматы",
    street: "пр. Гагарина",
    district: "Бостандыкский район",
    hours: { open: "08:00", close: "23:00" },
    coords: [76.903, 43.219],
    tags: ["Боулы"],
  },
  {
    id: "zhandosov",
    name: "URBO Жандосова",
    city: "Алматы",
    street: "ул. Жандосова",
    district: "Ауэзовский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.87, 43.2265],
    tags: ["С собой"],
  },
  {
    id: "ryskulov",
    name: "URBO Рыскулова",
    city: "Алматы",
    street: "пр. Рыскулова",
    district: "Жетысуский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.93, 43.2805],
    tags: ["С собой"],
  },
  {
    id: "shevchenko",
    name: "URBO Шевченко",
    city: "Алматы",
    street: "ул. Шевченко",
    district: "Алмалинский район",
    hours: { open: "07:30", close: "23:00" },
    coords: [76.918, 43.2465],
    tags: ["Завтраки"],
  },
  {
    id: "gres",
    name: "URBO ГРЭС",
    city: "Алматы",
    street: "мкр. ГРЭС",
    district: "Алатауский район",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.835, 43.278],
    tags: ["С собой", "Завтраки"],
  },
  {
    id: "kaskelen",
    name: "URBO Kaskelen",
    city: "Каскелен",
    street: "ул. Абылай хана",
    district: "Каскелен",
    hours: { open: "08:00", close: "22:00" },
    coords: [76.6225, 43.2006],
    tags: ["VIP-комната", "Завтраки"],
  },
];

export const cities: Array<"Все" | City> = ["Все", "Алматы", "Каскелен"];

const timeFmt = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Almaty",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function getStatus(branch: Branch, now: Date) {
  const nowMin = toMinutes(timeFmt.format(now));
  const open = toMinutes(branch.hours.open);
  const close = toMinutes(branch.hours.close);
  const isOpen = close > open ? nowMin >= open && nowMin < close : nowMin >= open || nowMin < close;
  return isOpen
    ? { isOpen, label: `Открыто до ${branch.hours.close}` }
    : { isOpen, label: `Закрыто · откроется в ${branch.hours.open}` };
}

/** Расстояние по прямой в километрах */
export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const routeUrl = (b: Branch) =>
  `https://2gis.kz/almaty/search/${encodeURIComponent(`URBO coffee ${b.street}`)}`;
