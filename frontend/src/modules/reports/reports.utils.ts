export function formatAmount(n: number): string {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return n < 0 ? `(${formatted})` : formatted;
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

export function firstDayOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
        .toISOString()
        .split("T")[0];
}
