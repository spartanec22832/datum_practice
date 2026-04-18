import { Link } from "react-router-dom";

const features = [
    {
        title: "Проекты",
        description:
            "Каталог проектов компании с описанием и отображением географии деятельности.",
    },
    {
        title: "Справочная информация",
        description:
            "База знаний с разделами, подразделами и карточками для хранения полезных материалов.",
    },
    {
        title: "Роутинг и ссылки",
        description:
            "У каждой сущности будет отдельная страница, чтобы можно было делиться прямыми ссылками.",
    },
];

const steps = [
    "Просматривать описание компании и структуру портала",
    "Открывать список проектов и изучать их карточки",
    "Переходить по разделам и карточкам базы знаний",
    "Авторизоваться для дальнейшей работы с контентом",
];

export default function HomePage() {
    return (
        <div className="space-y-12">
            <section className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-2 md:p-10">
                <div className="space-y-5">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Корпоративный портал
          </span>

                    <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                        Datum — единая точка доступа к проектам и знаниям компании
                    </h1>

                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                        Платформа объединяет информацию о проектах компании и внутреннюю
                        справочную базу знаний, чтобы сотрудники быстрее находили нужные
                        материалы и могли делиться ими по ссылке.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/projects"
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Перейти к проектам
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Войти
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl bg-slate-900 p-6 text-white">
                    <p className="text-sm text-slate-300">Основные возможности</p>

                    <div className="mt-6 space-y-4">
                        <div className="rounded-2xl bg-white/10 p-4">
                            <h3 className="text-lg font-semibold">Проекты на карте</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Карточки проектов будут связаны с геоданными и отображением на
                                карте.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <h3 className="text-lg font-semibold">Структурированная база знаний</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Разделы, подразделы, карточки, изображения, ссылки и другие
                                материалы в единой системе.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <h3 className="text-lg font-semibold">Авторизация и роли</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Позже здесь будет разграничение доступа между пользователями и
                                администраторами.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Что есть в системе</h2>
                    <p className="mt-2 text-slate-600">
                        Основные блоки платформы, которые будем постепенно реализовывать.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <article
                            key={feature.title}
                            className="rounded-2xl bg-white p-6 shadow-sm"
                        >
                            <h3 className="text-xl font-semibold text-slate-900">
                                {feature.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {feature.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                <article className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900">Как это будет работать</h2>
                    <ul className="mt-4 space-y-3">
                        {steps.map((step) => (
                            <li
                                key={step}
                                className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                            >
                                {step}
                            </li>
                        ))}
                    </ul>
                </article>

                <article className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900">Что делаем дальше</h2>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                        <p>
                            Следующий этап — подключить API и вывести реальные данные на
                            страницу проектов.
                        </p>
                        <p>
                            После этого можно будет сделать карточки проектов, а затем перейти
                            к авторизации и базе знаний.
                        </p>
                    </div>
                </article>
            </section>
        </div>
    );
}