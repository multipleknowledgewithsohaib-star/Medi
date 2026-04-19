export const getReportDateCutoff = () => {
    return new Date("2030-12-31T23:59:59.999Z");
};

const parseDateValue = (value: unknown): Date | null => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    const text = String(value ?? "").trim();
    if (!text) {
        return null;
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const isWithinReportWindow = (value: unknown) => {
    const date = parseDateValue(value);
    return Boolean(date && date.getTime() <= getReportDateCutoff().getTime());
};

export const clampDateToReportCutoff = (value: unknown) => {
    const date = parseDateValue(value);
    if (!date) {
        return "";
    }

    const reportDateCutoff = getReportDateCutoff();
    const safeDate = date.getTime() > reportDateCutoff.getTime() ? reportDateCutoff : date;
    return safeDate.toISOString().split("T")[0];
};
