import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
    {
        title: "Аналитические системы",
        description:
            "Разработка и внедрение информационных систем для мониторинга, контроля, учета и поддержки управленческих решений.",
    },
    {
        title: "Геоинформационные решения",
        description:
            "Создание web-ГИС и решений с пространственными данными для государственного сектора, инфраструктурных предприятий и бизнеса.",
    },
    {
        title: "Веб-разработка под ключ",
        description:
            "Проектирование, разработка и развитие корпоративных порталов, отраслевых сервисов и прикладных веб-приложений.",
    },
    {
        title: "Внедрение и сопровождение",
        description:
            "Адаптация, развитие и техническая поддержка решений на всех этапах эксплуатации.",
    },
];

const highlights = [
    { value: "с 2014", label: "развитие собственных ИТ-решений" },
    { value: "ИТ", label: "аккредитованная компания" },
    { value: "DATUM GIS", label: "собственная web-ГИС платформа" },
    { value: "B2G / B2B", label: "проекты для государства и бизнеса" },
];

export default function HomePage() {
    const { isAuthenticated } = useAuth();
    return (
        <div className="bg-slate-100">
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
                    <div className="absolute bottom-[-120px] right-[-40px] h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
                        <div>
                            <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                                DATUM Soft
                            </div>

                            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                                Разработка и внедрение
                                <span className="block text-cyan-300">
                  информационных систем
                </span>
                            </h1>

                            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                                DATUM Soft — аккредитованная ИТ-компания, специализирующаяся на
                                разработке аналитических информационных систем для
                                государственного сектора, естественных монополий,
                                инфраструктурных предприятий и крупного бизнеса.
                            </p>

                            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
                                Компания развивает собственные цифровые продукты и решения,
                                включая web-ГИС DATUM GIS, предназначенную для задач
                                мониторинга, контроля и аналитики пространственно привязанных
                                данных.
                            </p>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <Link
                                    to="/projects"
                                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                                >
                                    Смотреть проекты
                                </Link>

                                {!isAuthenticated && (
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Войти в систему
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            {highlights.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur"
                                >
                                    <div className="text-2xl font-bold text-cyan-300">
                                        {item.value}
                                    </div>
                                    <div className="mt-2 text-sm leading-6 text-slate-300">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                    <div>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              О компании
            </span>
                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Технологические решения для цифрового развития
                        </h2>
                    </div>

                    <div className="space-y-5 text-base leading-8 text-slate-700">
                        <p>
                            С 2014 года DATUM Soft выросла из небольшой команды,
                            внедрявшей сторонние геоинформационные системы, в самостоятельную
                            профильную ИТ-компанию с собственными программными продуктами и
                            экспертизой в области прикладных информационных систем.
                        </p>
                        <p>
                            Компания реализует проекты по разработке и внедрению различных
                            АИС, геоинформационных платформ и специализированных веб-решений
                            для государственных структур, естественных монополий,
                            инфраструктурных предприятий и крупного бизнеса.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-10">
                <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
                    <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Основные направления
            </span>
                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Чем занимается DATUM Soft
                        </h2>
                        <p className="mt-4 text-base leading-8 text-slate-600">
                            Компания сочетает разработку собственных продуктов, внедрение
                            информационных систем и развитие решений под задачи заказчика. По
                            материалам сайта в фокусе — аналитические ИС, геоинформационные
                            решения, веб-разработка и сопровождение внедренных систем.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {features.map((item) => (
                            <article
                                key={item.title}
                                className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="mb-4 h-10 w-10 rounded-2xl bg-cyan-100" />
                                <h3 className="text-xl font-semibold text-slate-900">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                    {item.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-10">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl bg-slate-900 p-8 text-white">
                        <h3 className="text-2xl font-bold">Собственная платформа</h3>
                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            DATUM GIS позиционируется как многофункциональная
                            геоинформационная система для мониторинга, контроля и аналитики
                            большого массива данных в пространственной привязке.
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Проекты для разных отраслей
                        </h3>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            На сайте компании представлены кейсы и внедрения для органов
                            власти, региональных систем, водоканалов и других инфраструктурных
                            организаций.
                        </p>
                    </div>

                    <div className="rounded-3xl bg-cyan-50 p-8 ring-1 ring-cyan-100">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Единая цифровая среда
                        </h3>
                        <p className="mt-4 text-sm leading-7 text-slate-700">
                            Эта платформа помогает централизованно представить информацию о
                            проектах компании и обеспечить удобную навигацию по корпоративным
                            материалам для сотрудников.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10">
                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-600 to-blue-700 p-8 text-white sm:p-10 lg:p-12">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Начать работу
              </span>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                Изучите проекты DATUM Soft
                            </h2>
                            <p className="mt-4 text-base leading-8 text-cyan-50">
                                Откройте список проектов компании, ознакомьтесь с направлениями
                                деятельности и используйте систему как единую точку доступа к
                                проектной информации.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                            <Link
                                to="/projects"
                                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                                Перейти к проектам
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    Войти в систему
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}