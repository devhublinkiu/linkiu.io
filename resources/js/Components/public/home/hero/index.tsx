import HeroText from './parts/HeroText'
import HeroBottle from './parts/HeroBottle'

export default function Hero() {
    return (
        <section className="bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center gap-12">
                <HeroText />
                <HeroBottle />
            </div>
        </section>
    )
}
