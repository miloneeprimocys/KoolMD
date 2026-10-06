import React from "react";

const Logo = () => (
    <svg width="60" height="60" viewBox="0 0 56 56" fill="none" aria-hidden="true" className="shrink-0">
        <defs>
            <linearGradient id="leafL" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--brand-teal)" />
                <stop offset="100%" stopColor="var(--brand-sky)" />
            </linearGradient>
            <linearGradient id="leafR" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--brand-green)" />
                <stop offset="100%" stopColor="var(--brand-teal)" />
            </linearGradient>
        </defs>
        <circle cx="28" cy="7" r="5.5" fill="var(--brand-sky)" />
        <path d="M26 16C10 14 2 24 3 40c1 8 6 13 14 14C13 44 16 28 26 16Z" fill="url(#leafL)" />
        <path d="M30 16c16-2 24 8 23 24-1 8-6 13-14 14 4-10 1-26-9-38Z" fill="url(#leafR)" />
    </svg>
);

const LeftSection = () => {
    return (
        <section className="relative hidden min-h-screen flex-1 overflow-hidden bg-gradient-to-br from-[var(--surface-start)] to-[var(--surface-end)] lg:flex lg:flex-col lg:items-center lg:justify-center">
            {/* ===== BACKGROUND SHADING – soft, clearly visible waves (bottom-right) + faint glow (top-right) ===== */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                viewBox="0 0 504 654"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="gHill" x1="0.5" y1="0" x2="0.5" y2="1">
                        <stop offset="0%" stopColor="var(--shape-sky)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0.75" />
                    </linearGradient>
                    <linearGradient id="gSweep" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--shape-sky)" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="var(--shape-blue)" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="gLeftArc" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--shape-sky)" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* faint glow, top-right only */}
                <path d="M0 40C60 110 130 230 150 380C154 430 156 470 158 500C130 420 100 300 50 200C30 160 10 120 0 100Z" fill="url(#gLeftArc)" />
                <path d="M0 180C40 250 90 350 104 470C108 500 110 520 112 540C80 470 40 380 0 300Z" fill="var(--shape-sky)" opacity="0.1" />
                <path d="M504 0V110C430 100 370 50 330 0H504Z" fill="var(--shape-mint)" opacity="0.12" />

                {/* big diagonal swoosh sweeping from the right edge down to the leaves */}
                <path d="M504 400C400 430 320 510 200 654H330C390 600 440 570 504 550V400Z" fill="url(#gSweep)" />

                {/* bottom hill – the visible blue shading under the leaves */}
                <path d="M150 654C215 585 340 520 504 552V654H150Z" fill="url(#gHill)" />

                {/* light highlight band between the two waves */}
                <path d="M504 548C420 560 340 600 260 654H330C390 625 450 600 504 592V548Z" fill="var(--card)" opacity="0.55" />
            </svg>

            {/* ===== LEAVES – viewBox padded so leaf edges never cut off during sway ===== */}
            <svg
                className="pointer-events-none absolute -bottom-1.5 left-0 h-[50%] aspect-[400/360] select-none overflow-visible"
                viewBox="0 90 400 345"
                fill="none"
                aria-hidden="true"
            >
                <defs>
                    {/* mint leaf: strong mint at the top-left, fading to sky */}
                    <linearGradient id="gMint" x1="0" y1="0" x2="0.75" y2="1">
                        <stop offset="0%" stopColor="var(--shape-mint)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0.6" />
                    </linearGradient>
                    {/* blue leaf: bright blue along the upper edge, soft light at the bottom-left */}
                    <linearGradient id="gBlue" x1="0.85" y1="0.1" x2="0.05" y2="1">
                        <stop offset="0%" stopColor="var(--shape-deep)" stopOpacity="1" />
                        <stop offset="55%" stopColor="var(--shape-blue)" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0.6" />
                    </linearGradient>
                    {/* small leaf: mint tip to sky base */}
                    <linearGradient id="gSmall" x1="0.9" y1="0" x2="0.15" y2="1">
                        <stop offset="0%" stopColor="var(--shape-mint)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--shape-sky)" stopOpacity="0.95" />
                    </linearGradient>
                </defs>

                {/* Big mint leaf (back) — broader */}
                <path
                    className="leaf leaf-a"
                    d="M295,435 C270,270 160,135 30,100 C55,225 165,355 295,435 Z"
                    fill="url(#gMint)"
                />
                {/* Blue leaf (front) — broader */}
                <path
                    className="leaf leaf-b"
                    d="M295,435 C225,320 105,260 10,300 C60,375 185,440 295,435 Z"
                    fill="url(#gBlue)"
                />
                {/* Small pointed leaf on the right — broader */}
                <path
                    className="leaf leaf-c"
                    d="M295,435 C372,400 400,315 365,250 C300,285 270,365 295,435 Z"
                    fill="url(#gSmall)"
                />
            </svg>

            {/* ===== MAIN HERO CONTENT ===== */}
            <div className="relative z-10 flex w-full max-w-2xl flex-col justify-center px-12 py-12 xl:px-20">
                <div className="flex items-center gap-4">
                    <Logo />
                    <div>
                        <h1 className="flex items-baseline text-5xl font-extrabold leading-none tracking-tight text-[var(--brand-navy)]">
                            KOOL<span className="text-[var(--brand-teal)]">MD</span>
                            <sup className="ml-1 align-super text-xs font-semibold text-[var(--body)]">®</sup>
                        </h1>
                        <p className="mt-1.5 text-lg font-semibold tracking-wide text-[var(--body)]">
                            Your Health. Our Priority.
                        </p>
                    </div>
                </div>

                <div className="my-8 h-1 w-16 rounded-full bg-[var(--accent-line)]" />

                <h2 className="text-4xl font-bold leading-[1.18] tracking-tight text-[var(--heading)] xl:text-[2.6rem]">
                    <span className="whitespace-nowrap">Modern Healthcare</span>
                    <br />
                    <span className="whitespace-nowrap">Made Simple</span>
                </h2>

                <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--body)] xl:text-xl">
                    Book appointments, consult with trusted doctors and manage your health — all in one place.
                </p>
            </div>
        </section>
    );
};

export default LeftSection;