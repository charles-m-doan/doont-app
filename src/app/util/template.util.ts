export interface Replacement {
    token: string;
    value: string;
    all: boolean;
}

export class TemplateUtil {
    // Escape for use in a RegExp
    private static escapeRegExp(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /**
     * Replace tokens in a template string using one or many Replacement objects.
     * Accepts individual replacements or arrays of them (mixed is fine).
     * Robust to null/undefined/empty inputs.
     */
    public static replace(
        template: string | null | undefined,
        ...repls: Array<Replacement | Replacement[] | null | undefined>
    ): string {
        // Normalize the template
        let out =
            typeof template === "string"
                ? template
                : template == null
                    ? ""
                    : String(template);

        if (!repls?.length) return out;

        // Flatten and sanitize replacements
        const flat: Replacement[] = [];
        for (const r of repls) {
            if (!r) continue;
            if (Array.isArray(r)) {
                for (const item of r) {
                    if (item && typeof item.token === "string") flat.push(item);
                }
            } else {
                flat.push(r);
            }
        }

        for (const rep of flat) {
            if (!rep || !rep.token) continue; // skip empties
            const value = rep.value ?? "";
            if (rep.all) {
                // Prefer replaceAll; fall back to a global RegExp
                if (typeof (out as any).replaceAll === "function") {
                    out = out.replaceAll(rep.token, value);
                } else {
                    const rx = new RegExp(TemplateUtil.escapeRegExp(rep.token), "g");
                    out = out.replace(rx, value);
                }
            } else {
                out = out.replace(rep.token, value);
            }
        }

        return out;
    }
}