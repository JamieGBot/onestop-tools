/*
 * ============================================================================
 * JAMIE — ONESTOP DRIVER REGO HELPER V15 — MINIMIZE BUTTON
 * ============================================================================
 *
 * PAGE:
 *   DP World OneStop — Stack Run Request / SRI Full + SRO manifest forms
 *
 * WHAT IT DOES:
 *   1. Copy any Rego + Driver Name rows from Excel.
 *   2. Paste as many separate batches as you want — new drivers are ADDED and
 *      existing drivers are UPDATED instead of replacing the whole list.
 *   3. Add / edit / remove drivers manually at any time.
 *   4. Search a driver or rego and click FILL.
 *   5. Keeps the list for the current browser session / day across page refreshes.
 *   6. V5 keeps text boxes stable while typing/pasting/editing (no lifecycle rebuild).
 *   7. V6 locks the current Rego / Truck Type / Driver across OneStop Add Container redraws.
 *   8. V7 uses a compact UI and docks it beside Set Manifest / Truck & Driver when space allows.
 *   9. V8 tabs OUT of Driver into Mobile after selecting the driver.
 *  10. V9 treats every FILL as a new transaction. A second FILL fully cancels the
 *      first helper transaction, clears stale dependent values, delays the driver
 *      commit until the rego lookup has started settling, and never copies a stale
 *      Mobile value from the previous driver.
 *  11. V10 keeps all V9 fill/race behaviour unchanged. This layout variant keeps
 *      the helper narrow, pushes it farther right, and makes the list taller for
 *      roughly 8–10 trucks.
 *  12. V11 is VISUAL ONLY: FILL buttons are blue and driver names are larger,
 *      darker and highlighted so each driver is much easier to scan quickly.
 *  13. V12 AUTO-OPENS MANIFEST: if the Truck/Driver form is not open when FILL
 *      is pressed, the helper presses OneStop's Manifest / Continue Manifesting
 *      control once, waits for the live form to load, then fills the requested driver.
 *      If a second FILL is pressed while the manifest is opening, the latest driver wins.
 *
 * FILL automatically:
 *   - Truck Rego  -> SelectTruckRegoForm___TRUCK_REGO_NO
 *   - TAB/blur     -> moves focus to BAT so OneStop's real rego onblur lookup runs
 *   - Truck Type  -> A-Double (ADOUBLE)
 *   - Driver      -> best safe match in CHMSIC
 *   - TAB/blur     -> moves focus Driver -> Mobile so OneStop commits driver/mobile
 *
 * Excel clipboard formatting:
 *   - If Excel supplies its normal HTML clipboard, green rows/cells are detected.
 *   - Green rows are marked TODAY.
 *   - If no green formatting can be detected, all pasted rows are treated as current.
 *
 * SAFETY:
 *   - Ambiguous OneStop driver-name matches are NOT guessed.
 *   - OneStop may auto-fill an OLD driver from the truck rego lookup. V3 clears
 *     that driver when the Excel name is ambiguous/no-match so it cannot look valid.
 *   - Rego + A-Double still fill; you then select the correct Driver manually.
 *   - No recurring network polling.
 */

(function () {
    "use strict";

    const NAME =
        "Jamie OneStop Driver Rego Helper V15 Minimize Button";

    const GUARD =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V15__";

    const PANEL_ID =
        "jamie-onestop-driver-rego-helper-v15";

    const STYLE_ID =
        "jamie-onestop-driver-rego-helper-v15-style";

    const host =
        String(
            location.hostname || ""
        ).toLowerCase();

    const path =
        String(
            location.pathname || ""
        ).toLowerCase();

    const TERMINALS = {
        "confr.vbs.1-stop.biz": {
            key: "DPW",
            label: "DP WORLD",
            fullLabel: "DP WORLD Fremantle"
        },
        "aslfr.vbs.1-stop.biz": {
            key: "PATRICK",
            label: "PATRICK",
            fullLabel: "Patrick Fremantle"
        }
    };

    const TERMINAL =
        TERMINALS[host] || null;

    /*
     * DPW's helper remains intentionally locked to StackRunReq.aspx.
     * Patrick manifesting can be launched from several OneStop pages, so V14
     * allows the helper anywhere on the Patrick Fremantle OneStop host and
     * finds the live Manifest / Truck & Driver controls when they appear.
     */
    const supportedPage =
        Boolean(TERMINAL) &&
        (
            TERMINAL.key === "PATRICK" ||
            path.endsWith(
                "/stackrunreq.aspx"
            )
        );

    if (!supportedPage) {
        console.info(
            `[${NAME}] Not a supported DPW / Patrick manifesting page — stopped.`
        );

        return;
    }

    const LEGACY_GUARD_V14 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V14__";

    const LEGACY_GUARD_V13 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V13__";

    const LEGACY_GUARD_V12 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V12__";

    const LEGACY_GUARD_V11 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V11__";

    const LEGACY_GUARD_V10 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V10__";

    const LEGACY_GUARD_V9 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V9__";

    const LEGACY_GUARD_V8 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V8__";

    const LEGACY_GUARD_V7 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V7__";

    const LEGACY_GUARD_V6 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V6__";

    const LEGACY_GUARD_V5 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V5__";

    const LEGACY_GUARD_V4 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V4__";

    const LEGACY_GUARD =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V3__";

    const LEGACY_GUARD_V2 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V2__";

    const LEGACY_GUARD_V1 =
        "__JAMIE_ONESTOP_DRIVER_REGO_HELPER_V1__";

    /*
     * V13 DATA STORAGE
     * ----------------
     * Driver/Rego entries now live in localStorage, so they survive:
     * - rerunning the bookmark
     * - refreshes
     * - closing/reopening the DPW tab
     * - closing/reopening the browser
     *
     * The old V12 helper used sessionStorage, which is why the list disappeared
     * when a new tab/session was used.
     */
    const DATA_KEY =
        "jamie-onestop-driver-rego-helper-v14-data";

    const LEGACY_DATA_KEY_V13 =
        "jamie-onestop-driver-rego-helper-v13-data";

    /*
     * localStorage is origin-specific, so DPW and Patrick cannot directly see
     * each other's localStorage. A compact parent-domain cookie carries just the
     * Driver/Rego list between confr.vbs.1-stop.biz and aslfr.vbs.1-stop.biz.
     *
     * localStorage remains the full source of truth on each terminal; the cookie
     * is only the small cross-terminal bridge.
     */
    const SHARED_DATA_COOKIE =
        "jamie_driver_rego_v14_shared";

    const LEGACY_SESSION_KEY_V12 =
        "jamie-onestop-driver-rego-helper-v12";

    const LEGACY_SESSION_KEY_V11 =
        "jamie-onestop-driver-rego-helper-v11";

    const LEGACY_SESSION_KEY_V10 =
        "jamie-onestop-driver-rego-helper-v10";

    const LEGACY_SESSION_KEY_V9 =
        "jamie-onestop-driver-rego-helper-v9";

    const LEGACY_SESSION_KEY_V8 =
        "jamie-onestop-driver-rego-helper-v8";

    const LEGACY_SESSION_KEY_V7 =
        "jamie-onestop-driver-rego-helper-v7";

    const LEGACY_SESSION_KEY_V6 =
        "jamie-onestop-driver-rego-helper-v6";

    const LEGACY_SESSION_KEY_V5 =
        "jamie-onestop-driver-rego-helper-v5";

    const LEGACY_SESSION_KEY_V4 =
        "jamie-onestop-driver-rego-helper-v4";

    const LEGACY_SESSION_KEY_V3 =
        "jamie-onestop-driver-rego-helper-v3";

    const LEGACY_SESSION_KEY_V2 =
        "jamie-onestop-driver-rego-helper-v2";

    function localDayKey() {
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    }

    function readCookieValue(name) {
        const prefix =
            `${name}=`;

        const part =
            String(document.cookie || "")
                .split(";")
                .map(value => value.trim())
                .find(value =>
                    value.startsWith(
                        prefix
                    )
                );

        return part
            ? part.slice(prefix.length)
            : "";
    }

    function readSharedDriverData() {
        try {
            const raw =
                readCookieValue(
                    SHARED_DATA_COOKIE
                );

            if (!raw) {
                return null;
            }

            const parsed =
                JSON.parse(
                    decodeURIComponent(
                        raw
                    )
                );

            if (
                !parsed ||
                !Array.isArray(
                    parsed.e
                )
            ) {
                return null;
            }

            return {
                day:
                    clean(
                        parsed.d || ""
                    ),
                entries:
                    parsed.e
                        .map(item => ({
                            rego:
                                upper(
                                    item?.[0]
                                ).replace(
                                    /\s+/g,
                                    ""
                                ),
                            name:
                                clean(
                                    item?.[1]
                                ),
                            current:
                                Boolean(
                                    item?.[2]
                                ),
                            source:
                                "shared",
                            updatedAt:
                                clean(
                                    item?.[3]
                                ) || null
                        }))
                        .filter(entry =>
                            entry.rego &&
                            entry.name
                        ),
                importedAt:
                    parsed.i || null,
                greenSignalsDetected:
                    Boolean(
                        parsed.g
                    )
            };
        } catch (_) {
            return null;
        }
    }

    function writeSharedDriverData(entries) {
        try {
            let compactEntries =
                (entries || [])
                    .filter(entry =>
                        clean(
                            entry?.rego
                        ) &&
                        clean(
                            entry?.name
                        )
                    )
                    .map(entry => [
                        upper(
                            entry.rego
                        ).replace(
                            /\s+/g,
                            ""
                        ),
                        clean(
                            entry.name
                        ),
                        entry.current
                            ? 1
                            : 0,
                        clean(
                            entry.updatedAt || ""
                        ).slice(
                            0,
                            24
                        )
                    ]);

            const makePayload = list =>
                encodeURIComponent(
                    JSON.stringify({
                        d:
                            localDayKey(),
                        e:
                            list,
                        i:
                            state?.importedAt
                                ? state.importedAt.toISOString()
                                : null,
                        g:
                            Boolean(
                                state?.greenSignalsDetected
                            )
                    })
                );

            let encoded =
                makePayload(
                    compactEntries
                );

            /*
             * Keep below normal cookie-size limits. If someone eventually has a
             * huge fleet list, retain the most recently updated mappings first.
             */
            if (encoded.length > 3600) {
                compactEntries =
                    (entries || [])
                        .slice()
                        .sort(
                            (a, b) =>
                                String(
                                    b.updatedAt || ""
                                ).localeCompare(
                                    String(
                                        a.updatedAt || ""
                                    )
                                )
                        )
                        .map(entry => [
                            upper(
                                entry.rego
                            ).replace(
                                /\s+/g,
                                ""
                            ),
                            clean(
                                entry.name
                            ),
                            entry.current
                                ? 1
                                : 0,
                            clean(
                                entry.updatedAt || ""
                            ).slice(
                                0,
                                24
                            )
                        ]);

                while (
                    compactEntries.length &&
                    (
                        encoded =
                            makePayload(
                                compactEntries
                            )
                    ).length >
                        3600
                ) {
                    compactEntries.pop();
                }
            }

            document.cookie =
                `${SHARED_DATA_COOKIE}=${encoded}; Domain=.vbs.1-stop.biz; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
        } catch (error) {
            console.warn(
                `[${NAME}] Could not sync Driver/Rego list between terminals:`,
                error
            );
        }
    }

    function clearSharedDriverData() {
        try {
            document.cookie =
                `${SHARED_DATA_COOKIE}=; Domain=.vbs.1-stop.biz; Path=/; Max-Age=0; SameSite=Lax; Secure`;
        } catch (_) {}
    }

    function mergeSavedEntryLists(
        lists
    ) {
        const byName =
            new Map();

        const regoOwner =
            new Map();

        for (
            const list of
            lists
        ) {
            for (
                const entry of
                list || []
            ) {
                const nameKey =
                    normaliseName(
                        entry?.name
                    );

                const regoKey =
                    upper(
                        entry?.rego
                    ).replace(
                        /\s+/g,
                        ""
                    );

                if (
                    !nameKey ||
                    !regoKey
                ) {
                    continue;
                }

                /*
                 * Lists are passed newest/preferred first. Once a name is owned,
                 * don't let an older local/session copy overwrite it.
                 */
                if (
                    byName.has(
                        nameKey
                    )
                ) {
                    continue;
                }

                const existingNameForRego =
                    regoOwner.get(
                        regoKey
                    );

                if (
                    existingNameForRego
                ) {
                    byName.delete(
                        existingNameForRego
                    );
                }

                byName.set(
                    nameKey,
                    {
                        ...entry,
                        rego:
                            regoKey,
                        name:
                            clean(
                                entry.name
                            )
                    }
                );

                regoOwner.set(
                    regoKey,
                    nameKey
                );
            }
        }

        return Array.from(
            byName.values()
        );
    }

    function normaliseSavedData(parsed) {
        if (!parsed || !Array.isArray(parsed.entries)) {
            return null;
        }

        const savedDay =
            clean(parsed.day || "");

        const today =
            localDayKey();

        /*
         * Keep every saved Driver/Rego across days, but TODAY is genuinely
         * day-specific. If the saved list came from a previous date, retain the
         * mapping and simply mark each entry as OLDER.
         */
        const entries =
            parsed.entries
                .filter(entry =>
                    clean(entry?.rego) &&
                    clean(entry?.name)
                )
                .map(entry => ({
                    ...entry,
                    current:
                        savedDay === today
                            ? Boolean(entry.current)
                            : false
                }));

        return {
            ...parsed,
            day:
                today,
            entries
        };
    }

    function readPersistentData() {
        const sources =
            [];

        let importedAt =
            null;

        let greenSignalsDetected =
            false;

        /*
         * Cross-terminal cookie goes first because it may contain a newer mapping
         * saved on the OTHER terminal.
         */
        const shared =
            normaliseSavedData(
                readSharedDriverData()
            );

        if (shared) {
            sources.push(
                shared.entries
            );

            importedAt =
                importedAt ||
                shared.importedAt ||
                null;

            greenSignalsDetected =
                greenSignalsDetected ||
                Boolean(
                    shared.greenSignalsDetected
                );
        }

        /*
         * V14 localStorage on the current terminal.
         */
        try {
            const raw =
                localStorage.getItem(
                    DATA_KEY
                );

            if (raw) {
                const parsed =
                    normaliseSavedData(
                        JSON.parse(
                            raw
                        )
                    );

                if (parsed) {
                    sources.push(
                        parsed.entries
                    );

                    importedAt =
                        importedAt ||
                        parsed.importedAt ||
                        null;

                    greenSignalsDetected =
                        greenSignalsDetected ||
                        Boolean(
                            parsed.greenSignalsDetected
                        );
                }
            }
        } catch (_) {}

        /*
         * Migrate V13 persistent DPW data automatically.
         */
        try {
            const raw =
                localStorage.getItem(
                    LEGACY_DATA_KEY_V13
                );

            if (raw) {
                const parsed =
                    normaliseSavedData(
                        JSON.parse(
                            raw
                        )
                    );

                if (parsed) {
                    sources.push(
                        parsed.entries
                    );

                    importedAt =
                        importedAt ||
                        parsed.importedAt ||
                        null;

                    greenSignalsDetected =
                        greenSignalsDetected ||
                        Boolean(
                            parsed.greenSignalsDetected
                        );
                }
            }
        } catch (_) {}

        /*
         * Migration from V12/V11/etc sessionStorage.
         */
        const sessionKeys = [
            LEGACY_SESSION_KEY_V12,
            LEGACY_SESSION_KEY_V11,
            LEGACY_SESSION_KEY_V10,
            LEGACY_SESSION_KEY_V9,
            LEGACY_SESSION_KEY_V8,
            LEGACY_SESSION_KEY_V7,
            LEGACY_SESSION_KEY_V6,
            LEGACY_SESSION_KEY_V5,
            LEGACY_SESSION_KEY_V4,
            LEGACY_SESSION_KEY_V3,
            LEGACY_SESSION_KEY_V2
        ];

        for (
            const key of
            sessionKeys
        ) {
            try {
                const raw =
                    sessionStorage.getItem(
                        key
                    );

                if (!raw) {
                    continue;
                }

                const parsed =
                    normaliseSavedData(
                        JSON.parse(
                            raw
                        )
                    );

                if (parsed) {
                    sources.push(
                        parsed.entries
                    );

                    importedAt =
                        importedAt ||
                        parsed.importedAt ||
                        null;

                    greenSignalsDetected =
                        greenSignalsDetected ||
                        Boolean(
                            parsed.greenSignalsDetected
                        );
                }
            } catch (_) {}
        }

        const entries =
            mergeSavedEntryLists(
                sources
            );

        if (!entries.length) {
            return null;
        }

        return {
            day:
                localDayKey(),
            entries,
            importedAt,
            greenSignalsDetected
        };
    }

    let carriedEntries = [];
    try {
        carriedEntries =
            window[GUARD]?.getEntries?.() ||
            window[LEGACY_GUARD_V14]?.getEntries?.() ||
            window[LEGACY_GUARD_V13]?.getEntries?.() ||
            window[LEGACY_GUARD_V12]?.getEntries?.() ||
            window[LEGACY_GUARD_V11]?.getEntries?.() ||
            window[LEGACY_GUARD_V10]?.getEntries?.() ||
            window[LEGACY_GUARD_V9]?.getEntries?.() ||
            window[LEGACY_GUARD_V8]?.getEntries?.() ||
            window[LEGACY_GUARD_V7]?.getEntries?.() ||
            window[LEGACY_GUARD_V6]?.getEntries?.() ||
            window[LEGACY_GUARD_V5]?.getEntries?.() ||
            window[LEGACY_GUARD_V4]?.getEntries?.() ||
            window[LEGACY_GUARD]?.getEntries?.() ||
            window[LEGACY_GUARD_V2]?.getEntries?.() ||
            window[LEGACY_GUARD_V1]?.getEntries?.() ||
            [];
    } catch (_) {}

    try { window[GUARD]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V14]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V13]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V12]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V11]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V10]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V9]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V8]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V7]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V6]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V5]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V4]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V2]?.cleanup?.(); } catch (_) {}
    try { window[LEGACY_GUARD_V1]?.cleanup?.(); } catch (_) {}

    document.getElementById(PANEL_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v14")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v14-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v13")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v13-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v12")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v12-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v11")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v11-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v10")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v10-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v9")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v9-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v8")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v8-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v7")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v7-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v6")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v6-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v5")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v5-style")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v4")?.remove();
    document.getElementById("jamie-onestop-driver-rego-helper-v4-style")?.remove();

    const savedData = readPersistentData();

    const state = {
        entries: savedData?.entries?.length ? savedData.entries : carriedEntries,
        importedAt: savedData?.importedAt ? new Date(savedData.importedAt) : null,
        greenSignalsDetected: Boolean(savedData?.greenSignalsDetected),
        currentOnly: false,
        query: "",
        fillToken: 0,
        fillTimers: [],
        activeFillCleanup: null,
        activeFillEnsure: null,
        preserveToken: 0,
        preserveTimers: [],
        lastFill: null,
        manifestOpenToken: 0,
        manifestOpening: false,
        pendingManifestEntry: null,
        manifestWaitTimers: [],
        manifestWaitObserver: null,
        observer: null,
        renderTimer: null,
        unbinders: [],
        importOpen: false,
        manualOpen: false,
        manualRego: "",
        manualName: "",
        manualCurrent: true,
        editingKey: "",
        minimized: false
    };

    function clean(
        value
    ) {
        return String(
            value ?? ""
        )
            .replace(
                /\u00a0/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }

    function upper(
        value
    ) {
        return clean(
            value
        ).toUpperCase();
    }

    function escapeHtml(
        value
    ) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    function normaliseName(
        value
    ) {
        return upper(
            value
        )
            .normalize(
                "NFKD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^A-Z0-9]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }

    function nameTokens(
        value
    ) {
        return normaliseName(
            value
        )
            .split(
                " "
            )
            .filter(
                token =>
                    token.length >= 2
            );
    }

    function looksLikeRego(
        value
    ) {
        const text =
            upper(
                value
            ).replace(
                /\s+/g,
                ""
            );

        return (
            /^[A-Z0-9]{3,9}$/.test(
                text
            ) &&
            /[A-Z]/.test(
                text
            ) &&
            /\d/.test(
                text
            ) &&
            !/^\d+$/.test(
                text
            )
        );
    }

    function looksLikeDriverName(
        value
    ) {
        const text =
            clean(
                value
            );

        return (
            text.length >= 2 &&
            /[A-Za-z]/.test(
                text
            ) &&
            !looksLikeRego(
                text
            )
        );
    }

    function isGreenColour(
        value
    ) {
        const text =
            String(
                value || ""
            ).toLowerCase();

        if (
            /\bgreen\b/.test(
                text
            )
        ) {
            return true;
        }

        const hexMatch =
            text.match(
                /#([0-9a-f]{6})\b/i
            );

        if (hexMatch) {
            const hex =
                hexMatch[1];

            const r =
                parseInt(
                    hex.slice(
                        0,
                        2
                    ),
                    16
                );

            const g =
                parseInt(
                    hex.slice(
                        2,
                        4
                    ),
                    16
                );

            const b =
                parseInt(
                    hex.slice(
                        4,
                        6
                    ),
                    16
                );

            return (
                g >= 90 &&
                g > r * 1.15 &&
                g > b * 1.10
            );
        }

        const rgbMatch =
            text.match(
                /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
            );

        if (rgbMatch) {
            const r =
                Number(
                    rgbMatch[1]
                );

            const g =
                Number(
                    rgbMatch[2]
                );

            const b =
                Number(
                    rgbMatch[3]
                );

            return (
                g >= 90 &&
                g > r * 1.15 &&
                g > b * 1.10
            );
        }

        return false;
    }

    function styleTextForClass(
        doc,
        className
    ) {
        if (
            !doc ||
            !className
        ) {
            return "";
        }

        const css =
            Array.from(
                doc.querySelectorAll(
                    "style"
                )
            )
                .map(
                    style =>
                        style.textContent || ""
                )
                .join(
                    "\n"
                );

        const escaped =
            className.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

        const match =
            css.match(
                new RegExp(
                    `\\.${escaped}(?:\\s|,|\\{)[^\\{]*\\{([^}]*)\\}`,
                    "i"
                )
            );

        return match
            ? match[1]
            : "";
    }

    function cellLooksGreen(
        cell,
        doc
    ) {
        if (!cell) {
            return false;
        }

        const direct = [
            cell.getAttribute(
                "style"
            ) || "",
            cell.getAttribute(
                "bgcolor"
            ) || ""
        ].join(
            " "
        );

        if (
            isGreenColour(
                direct
            )
        ) {
            return true;
        }

        return Array.from(
            cell.classList || []
        ).some(
            className =>
                isGreenColour(
                    styleTextForClass(
                        doc,
                        className
                    )
                )
        );
    }

    function dedupeEntries(
        entries
    ) {
        const byName =
            new Map();

        entries.forEach(
            entry => {
                const nameKey =
                    normaliseName(
                        entry.name
                    );

                if (!nameKey) {
                    return;
                }

                const existing =
                    byName.get(
                        nameKey
                    );

                if (
                    !existing ||
                    entry.current ||
                    !existing.current
                ) {
                    byName.set(
                        nameKey,
                        entry
                    );
                }
            }
        );

        return Array.from(
            byName.values()
        ).sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );
    }

    function savePersistentData() {
        const payload = {
            day:
                localDayKey(),
            entries:
                state.entries,
            importedAt:
                state.importedAt
                    ? state.importedAt.toISOString()
                    : null,
            greenSignalsDetected:
                state.greenSignalsDetected,
            savedAt:
                new Date().toISOString()
        };

        try {
            localStorage.setItem(
                DATA_KEY,
                JSON.stringify(
                    payload
                )
            );

            /*
             * V14 cross-terminal sync: compact Driver/Rego mapping for the other
             * OneStop Fremantle terminal.
             */
            writeSharedDriverData(
                state.entries
            );
        } catch (error) {
            console.warn(
                `[${NAME}] Could not save Driver/Rego list to localStorage:`,
                error
            );
        }

        /*
         * Session copy is only a secondary fallback. localStorage is the source
         * of truth in V13.
         */
        try {
            sessionStorage.setItem(
                "jamie-onestop-driver-rego-helper-v14-session-backup",
                JSON.stringify(
                    payload
                )
            );
        } catch (_) {}
    }

    function clearPersistentData() {
        try {
            localStorage.removeItem(
                DATA_KEY
            );

            localStorage.removeItem(
                LEGACY_DATA_KEY_V13
            );
        } catch (_) {}

        clearSharedDriverData();

        try {
            sessionStorage.removeItem(
                "jamie-onestop-driver-rego-helper-v14-session-backup"
            );
        } catch (_) {}

        /*
         * Remove old session keys too so CLEAR ALL really means clear all.
         */
        [
            LEGACY_SESSION_KEY_V12,
            LEGACY_SESSION_KEY_V11,
            LEGACY_SESSION_KEY_V10,
            LEGACY_SESSION_KEY_V9,
            LEGACY_SESSION_KEY_V8,
            LEGACY_SESSION_KEY_V7,
            LEGACY_SESSION_KEY_V6,
            LEGACY_SESSION_KEY_V5,
            LEGACY_SESSION_KEY_V4,
            LEGACY_SESSION_KEY_V3,
            LEGACY_SESSION_KEY_V2
        ].forEach(
            key => {
                try {
                    sessionStorage.removeItem(
                        key
                    );
                } catch (_) {}
            }
        );
    }

    function entryNameKey(entry) {
        return normaliseName(entry?.name);
    }

    function entryRegoKey(entry) {
        return upper(entry?.rego).replace(/\s+/g, "");
    }

    function sortEntries() {
        state.entries.sort((a, b) => clean(a.name).localeCompare(clean(b.name)));
    }

    function mergeEntries(incoming, options = {}) {
        const replaceAll = Boolean(options.replaceAll);
        const source = clean(options.source || "paste");
        const prepared = dedupeEntries(incoming).map(entry => ({
            rego: entryRegoKey(entry),
            name: clean(entry.name),
            current: Boolean(entry.current),
            source,
            updatedAt: new Date().toISOString()
        }));

        if (replaceAll) {
            state.entries = prepared;
            sortEntries();
            savePersistentData();
            return { added: prepared.length, updated: 0, removedConflicts: 0 };
        }

        let added = 0;
        let updated = 0;
        let removedConflicts = 0;

        prepared.forEach(incomingEntry => {
            const nameKey = entryNameKey(incomingEntry);
            const regoKey = entryRegoKey(incomingEntry);
            if (!nameKey || !regoKey) return;

            const sameNameIndex = state.entries.findIndex(entry => entryNameKey(entry) === nameKey);

            state.entries = state.entries.filter((entry, index) => {
                if (index === sameNameIndex) return true;
                const sameRego = entryRegoKey(entry) === regoKey;
                if (sameRego) removedConflicts += 1;
                return !sameRego;
            });

            const refreshedSameNameIndex = state.entries.findIndex(entry => entryNameKey(entry) === nameKey);
            if (refreshedSameNameIndex >= 0) {
                state.entries[refreshedSameNameIndex] = {
                    ...state.entries[refreshedSameNameIndex],
                    ...incomingEntry
                };
                updated += 1;
            } else {
                state.entries.push(incomingEntry);
                added += 1;
            }
        });

        sortEntries();
        savePersistentData();
        return { added, updated, removedConflicts };
    }

    function removeEntryByName(name) {
        const key = normaliseName(name);
        const before = state.entries.length;
        state.entries = state.entries.filter(entry => entryNameKey(entry) !== key);
        const removed = before - state.entries.length;
        if (removed) savePersistentData();
        return removed;
    }

    function rowsToEntries(
        rows
    ) {
        const entries =
            [];

        rows.forEach(
            row => {
                for (
                    let i = 0;
                    i < row.length;
                    i += 1
                ) {
                    const current =
                        row[i];

                    if (
                        !looksLikeRego(
                            current.text
                        )
                    ) {
                        continue;
                    }

                    let nameCell =
                        null;

                    for (
                        let j = i + 1;
                        j < row.length;
                        j += 1
                    ) {
                        if (
                            clean(
                                row[j].text
                            )
                        ) {
                            nameCell =
                                row[j];

                            break;
                        }
                    }

                    if (
                        !nameCell ||
                        !looksLikeDriverName(
                            nameCell.text
                        )
                    ) {
                        continue;
                    }

                    entries.push({
                        rego:
                            upper(
                                current.text
                            ).replace(
                                /\s+/g,
                                ""
                            ),
                        name:
                            clean(
                                nameCell.text
                            ),
                        current:
                            Boolean(
                                current.green ||
                                nameCell.green
                            )
                    });
                }
            }
        );

        return dedupeEntries(
            entries
        );
    }

    function parseExcelHtml(
        html
    ) {
        if (
            !clean(
                html
            )
        ) {
            return [];
        }

        try {
            const doc =
                new DOMParser()
                    .parseFromString(
                        html,
                        "text/html"
                    );

            const rows =
                Array.from(
                    doc.querySelectorAll(
                        "tr"
                    )
                ).map(
                    tr =>
                        Array.from(
                            tr.querySelectorAll(
                                "th, td"
                            )
                        ).map(
                            td => ({
                                text:
                                    clean(
                                        td.textContent
                                    ),
                                green:
                                    cellLooksGreen(
                                        td,
                                        doc
                                    )
                            })
                        )
                );

            return rowsToEntries(
                rows
            );
        } catch (_) {
            return [];
        }
    }

    function parseExcelText(
        text
    ) {
        const rows =
            String(
                text || ""
            )
                .split(
                    /\r?\n/
                )
                .map(
                    line => {
                        let cells =
                            line.split(
                                "\t"
                            );

                        if (
                            cells.length === 1
                        ) {
                            const first =
                                clean(
                                    cells[0]
                                );

                            const match =
                                first.match(
                                    /^([A-Za-z0-9]{3,9})\s+(.+)$/
                                );

                            if (match) {
                                cells = [
                                    match[1],
                                    match[2]
                                ];
                            }
                        }

                        return cells.map(
                            cell => ({
                                text:
                                    clean(
                                        cell
                                    ),
                                green:
                                    false
                            })
                        );
                    }
                );

        return rowsToEntries(
            rows
        );
    }

    function importClipboard(
        plainText,
        htmlText,
        options = {}
    ) {
        const htmlEntries = parseExcelHtml(htmlText);
        const plainEntries = parseExcelText(plainText);
        let entries = htmlEntries.length ? htmlEntries : plainEntries;

        if (!entries.length) {
            setMessage("No Rego + Driver rows found in that paste.", "error");
            return false;
        }

        const hasGreen = entries.some(entry => entry.current);
        if (!hasGreen) {
            entries = entries.map(entry => ({ ...entry, current: true }));
        }

        const stats = mergeEntries(entries, {
            replaceAll: Boolean(options.replaceAll),
            source: "excel"
        });

        state.greenSignalsDetected = state.greenSignalsDetected || hasGreen;
        state.currentOnly = false;
        state.importedAt = new Date();
        state.importOpen = true;
        savePersistentData();
        renderPanel();

        const currentCount = state.entries.filter(entry => entry.current).length;
        const modeText = options.replaceAll
            ? `REPLACED LIST with ${entries.length} drivers`
            : `${stats.added} added • ${stats.updated} updated`;

        setMessage(
            `${modeText} • ${state.entries.length} total • ${currentCount} current${stats.removedConflicts ? ` • ${stats.removedConflicts} old rego conflict(s) removed` : ""}.`,
            "success"
        );

        setTimeout(() => {
            const textarea = document.getElementById(`${PANEL_ID}-paste`);
            if (textarea) {
                textarea.value = "";
                textarea.focus();
            }
        }, 0);

        return true;
    }

    function visibleFieldDescriptor(
        element
    ) {
        return clean([
            element?.id,
            element?.getAttribute?.("name"),
            element?.getAttribute?.("title"),
            element?.getAttribute?.("placeholder"),
            element?.getAttribute?.("aria-label")
        ].filter(Boolean).join(" "));
    }

    function getRegoInput() {
        const exact =
            document.querySelector(
                '#SelectTruckRegoForm___TRUCK_REGO_NO'
            );

        if (exact) {
            return exact;
        }

        return Array.from(
            document.querySelectorAll(
                'input:not([type="hidden"])'
            )
        ).find(element => {
            if (element.closest?.(`#${PANEL_ID}`)) return false;

            const descriptor =
                visibleFieldDescriptor(
                    element
                );

            return (
                /\brego\b/i.test(
                    descriptor
                ) ||
                /registration\s*(?:no|number)?/i.test(
                    descriptor
                )
            );
        }) || null;
    }

    function getBatInput() {
        const exact =
            document.querySelector(
                '#SelectTruckRegoForm___BAT'
            );

        if (exact) {
            return exact;
        }

        return Array.from(
            document.querySelectorAll(
                'input:not([type="hidden"])'
            )
        ).find(element => {
            if (element.closest?.(`#${PANEL_ID}`)) return false;

            return /\bbat\b/i.test(
                visibleFieldDescriptor(
                    element
                )
            );
        }) || null;
    }

    function getTruckTypeSelect() {
        const exact =
            document.querySelector(
                '#IDTRUCKTYPE'
            );

        if (exact) {
            return exact;
        }

        return Array.from(
            document.querySelectorAll(
                "select"
            )
        ).find(element => {
            if (element.closest?.(`#${PANEL_ID}`)) return false;

            const descriptor =
                visibleFieldDescriptor(
                    element
                );

            if (
                /truck.*type|vehicle.*type|combination/i.test(
                    descriptor
                )
            ) {
                return true;
            }

            const optionText =
                Array.from(
                    element.options || []
                )
                    .map(option =>
                        clean(
                            option.textContent
                        )
                    )
                    .join(
                        " "
                    );

            return /\bA[\s-]*DOUBLE\b/i.test(
                optionText
            );
        }) || null;
    }

    function getDriverSelect() {
        const exact =
            document.querySelector(
                '#CHMSIC'
            );

        if (exact) {
            return exact;
        }

        return Array.from(
            document.querySelectorAll(
                "select"
            )
        ).find(element => {
            if (element.closest?.(`#${PANEL_ID}`)) return false;
            if (element === getTruckTypeSelect()) return false;

            const descriptor =
                visibleFieldDescriptor(
                    element
                );

            if (
                /\bdriver\b|\bmsic\b/i.test(
                    descriptor
                )
            ) {
                return true;
            }

            const labels =
                Array.from(
                    element.options || []
                )
                    .slice(
                        0,
                        8
                    )
                    .map(option =>
                        clean(
                            option.textContent
                        )
                    );

            return labels.some(label =>
                /X{2,}|\*{2,}|NOT REGISTERED|MSIC/i.test(
                    label
                )
            );
        }) || null;
    }

    function getManifestForm() {
        return (
            document.querySelector(
                '#SelectTruckRegoForm'
            ) ||
            getRegoInput()
                ?.closest?.(
                    "form"
                ) ||
            null
        );
    }

    function getTruckDriverHolder() {
        const exact =
            document.querySelector(
                '#SRMTruckAndDriverDetails'
            );

        if (exact) {
            return exact;
        }

        const rego =
            getRegoInput();

        return (
            rego?.closest?.(
                "fieldset, .ui-dialog, .modal, .popup, .content, table"
            ) ||
            rego?.parentElement ||
            null
        );
    }

    function getDriverOptions() {
        const select =
            getDriverSelect();

        if (!select) {
            return [];
        }

        return Array.from(
            select.options || []
        )
            .filter(
                option =>
                    clean(
                        option.value
                    )
            )
            .map(
                option => {
                    const label =
                        clean(
                            option.textContent
                        );

                    const name =
                        clean(
                            label.split(
                                /\s+-\s+X{3,}/i
                            )[0]
                        );

                    return {
                        value:
                            option.value,
                        label,
                        name,
                        normalised:
                            normaliseName(
                                name
                            ),
                        tokens:
                            nameTokens(
                                name
                            )
                    };
                }
            );
    }

    function scoreNameMatch(
        excelName,
        option
    ) {
        const wanted =
            normaliseName(
                excelName
            );

        const wantedTokens =
            nameTokens(
                excelName
            );

        if (
            !wanted ||
            !wantedTokens.length
        ) {
            return 0;
        }

        if (
            wanted ===
            option.normalised
        ) {
            return 1000;
        }

        const optionSet =
            new Set(
                option.tokens
            );

        const wantedSet =
            new Set(
                wantedTokens
            );

        const allWantedInOption =
            wantedTokens.every(
                token =>
                    optionSet.has(
                        token
                    )
            );

        if (
            allWantedInOption
        ) {
            return (
                900 +
                wantedTokens.length * 5 -
                Math.max(
                    0,
                    option.tokens.length -
                    wantedTokens.length
                )
            );
        }

        const allOptionInWanted =
            option.tokens.every(
                token =>
                    wantedSet.has(
                        token
                    )
            );

        if (
            allOptionInWanted
        ) {
            return (
                840 +
                option.tokens.length * 5
            );
        }

        const overlap =
            wantedTokens.filter(
                token =>
                    optionSet.has(
                        token
                    )
            ).length;

        const union =
            new Set([
                ...wantedTokens,
                ...option.tokens
            ]).size;

        let score =
            union
                ? (
                    overlap /
                    union
                ) * 700
                : 0;

        if (
            wantedTokens[0] &&
            option.tokens[0] ===
                wantedTokens[0]
        ) {
            score += 70;
        }

        const wantedLast =
            wantedTokens[
                wantedTokens.length - 1
            ];

        const optionLast =
            option.tokens[
                option.tokens.length - 1
            ];

        if (
            wantedLast &&
            optionLast ===
                wantedLast
        ) {
            score += 90;
        }

        return score;
    }

    function findDriverMatch(
        excelName
    ) {
        const options =
            getDriverOptions();

        const scored =
            options
                .map(
                    option => ({
                        ...option,
                        score:
                            scoreNameMatch(
                                excelName,
                                option
                            )
                    })
                )
                .filter(
                    option =>
                        option.score >= 620
                )
                .sort(
                    (a, b) =>
                        b.score -
                        a.score
                );

        if (!scored.length) {
            return {
                status:
                    "none",
                option:
                    null,
                candidates:
                    []
            };
        }

        const best =
            scored[0];

        const second =
            scored[1];

        if (
            second &&
            Math.abs(
                best.score -
                second.score
            ) <= 3
        ) {
            return {
                status:
                    "ambiguous",
                option:
                    null,
                candidates:
                    scored.slice(
                        0,
                        4
                    )
            };
        }

        return {
            status:
                "matched",
            option:
                best,
            candidates:
                scored.slice(
                    0,
                    4
                )
        };
    }

    function dispatch(
        element,
        type
    ) {
        if (!element) {
            return;
        }

        try {
            element.dispatchEvent(
                new Event(
                    type,
                    {
                        bubbles:
                            true
                    }
                )
            );
        } catch (_) {}
    }

    function setTruckTypeADouble() {
        const select =
            getTruckTypeSelect();

        if (!select) {
            return false;
        }

        const option =
            Array.from(
                select.options || []
            ).find(option =>
                upper(
                    option.value
                ) ===
                    "ADOUBLE"
            ) ||
            Array.from(
                select.options || []
            ).find(option =>
                /\bA[\s-]*DOUBLE\b/i.test(
                    clean(
                        option.textContent
                    )
                )
            );

        if (!option) {
            return false;
        }

        if (
            select.value !==
            option.value
        ) {
            select.value =
                option.value;

            dispatch(
                select,
                "input"
            );

            dispatch(
                select,
                "change"
            );
        }

        return true;
    }

    function setDriverOption(
        match
    ) {
        if (
            !match ||
            match.status !==
                "matched" ||
            !match.option
        ) {
            return { ok: false, changed: false, select: null };
        }

        const select =
            getDriverSelect();

        if (!select) {
            return { ok: false, changed: false, select: null };
        }

        const changed =
            select.value !==
            match.option.value;

        if (changed) {
            select.value =
                match.option.value;

            /* A real select choice normally produces both input + change. */
            dispatch(
                select,
                "input"
            );

            dispatch(
                select,
                "change"
            );
        }

        return { ok: true, changed, select };
    }

    function clearDriverOption() {
        const select =
            getDriverSelect();

        if (!select) {
            return false;
        }

        if (select.value !== "") {
            select.value = "";
            dispatch(
                select,
                "change"
            );
        }

        return true;
    }

    function dispatchKeyboard(
        element,
        type,
        key
    ) {
        if (!element) return;

        try {
            element.dispatchEvent(
                new KeyboardEvent(
                    type,
                    {
                        key,
                        code: key,
                        keyCode: key === "Tab" ? 9 : 0,
                        which: key === "Tab" ? 9 : 0,
                        bubbles: true,
                        cancelable: true
                    }
                )
            );
        } catch (_) {}
    }

    function tabOutOfRego(
        regoInput
    ) {
        if (!regoInput) return false;

        const batInput =
            getBatInput();

        try {
            regoInput.focus({
                preventScroll: true
            });
        } catch (_) {
            try { regoInput.focus(); } catch (_) {}
        }

        /*
         * Synthetic Tab alone cannot make the browser move focus. Send the Tab
         * key events for page handlers, then ACTUALLY move focus to BAT. That
         * fires the real native blur/onblur on Truck Rego, which is exactly
         * where OneStop calls fetchTruckDetails(this) and populates BAT.
         */
        dispatchKeyboard(
            regoInput,
            "keydown",
            "Tab"
        );

        if (batInput) {
            try {
                batInput.focus({
                    preventScroll: true
                });
            } catch (_) {
                try { batInput.focus(); } catch (_) {}
            }
        } else {
            try { regoInput.blur(); } catch (_) {}
        }

        dispatchKeyboard(
            regoInput,
            "keyup",
            "Tab"
        );

        return true;
    }

    function findMobileInput() {
        const candidates = [
            "SelectTruckRegoForm___MOBILE",
            "SelectTruckRegoForm___MOBILE_NO",
            "SelectTruckRegoForm___MOBILE_NUMBER",
            "SelectTruckRegoForm___MOBILENO",
            "IDMOBILE",
            "MOBILE"
        ];

        for (const id of candidates) {
            const element = document.getElementById(id);
            if (element && isActuallyVisible(element)) {
                return element;
            }
        }

        /* Prefer a control whose own id/name/title clearly says Mobile. */
        try {
            const named = Array.from(
                document.querySelectorAll('input:not([type="hidden"]), textarea')
            ).find(element => {
                if (!isActuallyVisible(element)) return false;
                if (element.closest?.(`#${PANEL_ID}`)) return false;

                const descriptor = clean([
                    element.id,
                    element.getAttribute?.("name"),
                    element.getAttribute?.("title"),
                    element.getAttribute?.("placeholder"),
                    element.getAttribute?.("aria-label")
                ].filter(Boolean).join(" "));

                return /\bmobile\b/i.test(descriptor);
            });

            if (named) return named;
        } catch (_) {}

        /* Then use OneStop's visible "Mobile" label and its associated input. */
        try {
            const label = Array.from(document.querySelectorAll("label, td, span, div"))
                .find(element => {
                    if (!isActuallyVisible(element)) return false;
                    if (element.closest?.(`#${PANEL_ID}`)) return false;
                    if (element.children?.length) return false;
                    return /^mobile\s*\*?$/i.test(clean(element.textContent));
                });

            if (label) {
                const htmlFor = label.getAttribute?.("for");
                if (htmlFor) {
                    const associated = document.getElementById(htmlFor);
                    if (associated && isActuallyVisible(associated)) return associated;
                }

                const row = label.closest?.("tr") || label.parentElement;
                const nearby = row?.querySelector?.('input:not([type="hidden"]), textarea');
                if (nearby && isActuallyVisible(nearby)) return nearby;
            }
        } catch (_) {}

        /* Last fallback: Mobile is the next visible text/tel input after Driver. */
        try {
            const driver = getDriverSelect();
            if (!driver) return null;

            const fields = Array.from(
                document.querySelectorAll('select, input:not([type="hidden"]), textarea')
            ).filter(element =>
                isActuallyVisible(element) &&
                !element.closest?.(`#${PANEL_ID}`)
            );

            const driverIndex = fields.indexOf(driver);
            if (driverIndex < 0) return null;

            return fields.slice(driverIndex + 1).find(element => {
                if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
                    return false;
                }

                const type = String(element.getAttribute?.("type") || "text").toLowerCase();
                return ["text", "tel", "number"].includes(type);
            }) || null;
        } catch (_) {
            return null;
        }
    }

    function tabOutOfDriver(
        driverSelect
    ) {
        if (!driverSelect) return false;

        const mobileInput =
            findMobileInput();

        try {
            driverSelect.focus({
                preventScroll: true
            });
        } catch (_) {
            try { driverSelect.focus(); } catch (_) {}
        }

        /*
         * IMPORTANT: selecting Driver is not enough on this OneStop form.
         * Driver must lose focus exactly like Jamie selected it and pressed TAB.
         * Moving focus Driver -> Mobile fires OneStop's real blur/onblur lifecycle,
         * which commits the selected driver and lets OneStop populate Mobile.
         */
        dispatchKeyboard(
            driverSelect,
            "keydown",
            "Tab"
        );

        if (mobileInput) {
            try {
                mobileInput.focus({
                    preventScroll: true
                });
            } catch (_) {
                try { mobileInput.focus(); } catch (_) {}
            }
        } else {
            try { driverSelect.blur(); } catch (_) {}
        }

        dispatchKeyboard(
            driverSelect,
            "keyup",
            "Tab"
        );

        return true;
    }

    function clearFillEnforcement() {
        state.fillToken += 1;

        state.fillTimers.splice(0).forEach(timer => {
            try { clearTimeout(timer); } catch (_) {}
        });

        const cleanupActive = state.activeFillCleanup;
        state.activeFillCleanup = null;
        state.activeFillEnsure = null;

        if (cleanupActive) {
            try { cleanupActive(); } catch (_) {}
        }
    }

    function cancelAddContainerPreserve() {
        state.preserveToken += 1;
        state.preserveTimers.splice(0).forEach(timer => {
            try { clearTimeout(timer); } catch (_) {}
        });
    }

    function getTruckDriverSnapshot() {
        const regoInput = getRegoInput();
        const truckType = getTruckTypeSelect();
        const driverSelect = getDriverSelect();
        const mobileInput = findMobileInput();

        if (!regoInput || !truckType || !driverSelect) return null;

        const rego = upper(regoInput.value).replace(/\s+/g, "");
        if (!rego) return null;

        /*
         * Capture EXACTLY what is visible at the instant Add Container is clicked.
         * The document capture listener runs before OneStop's own click handler, so
         * these values are safer than preferring a stale lastFill value.
         */
        const driverLabel = clean(
            driverSelect.options?.[driverSelect.selectedIndex]?.textContent || ""
        );
        const mobileHint = mobileHintFromDriverLabel(driverLabel);
        const rawMobile = mobileInput ? String(mobileInput.value ?? "") : null;
        const safeMobile = (
            rawMobile !== null &&
            (!mobileHint || mobileMatchesDriverHint(mobileInput, mobileHint))
        ) ? rawMobile : null;

        return {
            rego,
            truckType: truckType.value || "",
            driverValue: driverSelect.value || "",
            driverName: driverLabel,
            mobileValue: safeMobile
        };
    }

    function restoreTruckDriverSnapshot(snapshot, token) {
        if (!snapshot || token !== state.preserveToken) return false;

        const regoInput = getRegoInput();
        const truckType = getTruckTypeSelect();
        const driverSelect = getDriverSelect();
        const mobileInput = findMobileInput();
        if (!regoInput || !truckType || !driverSelect) return false;

        const currentRego = upper(regoInput.value).replace(/\s+/g, "");

        /*
         * Never overwrite a different truck the user has started entering after the
         * Add Container click. Blank/same rego is safe to restore.
         */
        if (currentRego && currentRego !== snapshot.rego) {
            cancelAddContainerPreserve();
            return false;
        }

        if (!currentRego && snapshot.rego) {
            regoInput.value = snapshot.rego;
            dispatch(regoInput, "input");
            dispatch(regoInput, "change");
        }

        if (
            snapshot.truckType &&
            Array.from(truckType.options || []).some(option => option.value === snapshot.truckType) &&
            truckType.value !== snapshot.truckType
        ) {
            truckType.value = snapshot.truckType;
            dispatch(truckType, "input");
            dispatch(truckType, "change");
        }

        if (
            snapshot.driverValue &&
            Array.from(driverSelect.options || []).some(option => option.value === snapshot.driverValue) &&
            driverSelect.value !== snapshot.driverValue
        ) {
            driverSelect.value = snapshot.driverValue;
            dispatch(driverSelect, "input");
            dispatch(driverSelect, "change");
        }

        /* Mobile is part of the protected Add Container snapshot in V8. */
        if (
            mobileInput &&
            snapshot.mobileValue !== null &&
            String(mobileInput.value ?? "") !== snapshot.mobileValue
        ) {
            mobileInput.value = snapshot.mobileValue;
            dispatch(mobileInput, "input");
            dispatch(mobileInput, "change");
        }

        return true;
    }

    function isAddContainerControl(target) {
        const control = target?.closest?.(
            'button, input, a, [role="button"]'
        );
        if (!control) return null;

        const label = clean([
            control.textContent,
            control.value,
            control.title,
            control.id,
            control.getAttribute?.("name"),
            control.getAttribute?.("aria-label")
        ].filter(Boolean).join(" "));

        return /\badd\s+container\b/i.test(label)
            ? control
            : null;
    }

    function installAddContainerProtection() {
        const onAddContainer = event => {
            if (!isAddContainerControl(event.target)) return;

            /* Give the active V9 transaction one final synchronous correctness pass. */
            try { state.activeFillEnsure?.({ forceDriverCommit: true, allowRegoRetry: false }); } catch (_) {}

            const snapshot = getTruckDriverSnapshot();
            if (!snapshot) return;

            /*
             * CRITICAL: stop old FILL timers before OneStop handles Add Container.
             * Otherwise a timer from the previous autofill can collide with the
             * Add Container redraw and write stale Driver/Mobile values.
             */
            clearFillEnforcement();
            cancelAddContainerPreserve();
            const token = state.preserveToken;

            restoreTruckDriverSnapshot(snapshot, token);

            /*
             * OneStop can redraw these controls more than once. Re-query the live
             * elements every pass and restore Rego / A-Double / Driver / Mobile only
             * while the rego is still blank or the same truck.
             */
            [0, 80, 220, 500, 900, 1500, 2400].forEach(delay => {
                const timer = setTimeout(
                    () => restoreTruckDriverSnapshot(snapshot, token),
                    delay
                );
                state.preserveTimers.push(timer);
            });
        };

        const onProtectedFieldUserActivity = event => {
            const target = event?.target;
            if (!target || !event.isTrusted) return;

            const isMobile =
                target ===
                findMobileInput();

            const protectedField =
                target ===
                    getRegoInput() ||
                target ===
                    getBatInput() ||
                target ===
                    getTruckTypeSelect() ||
                target ===
                    getDriverSelect();

            if (
                !protectedField &&
                !isMobile
            ) {
                return;
            }

            /*
             * Once Jamie starts manually changing the next truck/driver/mobile,
             * cancel BOTH kinds of delayed restore. Nothing from the previous fill
             * is allowed to fight genuine manual input.
             */
            cancelAddContainerPreserve();
            clearFillEnforcement();

            const snapshot = getTruckDriverSnapshot();
            if (snapshot) {
                state.lastFill = {
                    rego: snapshot.rego,
                    truckType: snapshot.truckType,
                    driverValue: snapshot.driverValue,
                    driverName: snapshot.driverName,
                    mobileValue: snapshot.mobileValue
                };
            }
        };

        document.addEventListener("click", onAddContainer, true);
        document.addEventListener("input", onProtectedFieldUserActivity, true);
        document.addEventListener("change", onProtectedFieldUserActivity, true);

        state.unbinders.push(
            () => document.removeEventListener("click", onAddContainer, true),
            () => document.removeEventListener("input", onProtectedFieldUserActivity, true),
            () => document.removeEventListener("change", onProtectedFieldUserActivity, true)
        );
    }


    function mobileHintFromDriverLabel(label) {
        const text = clean(label || "");
        if (!text) return "";

        /*
         * OneStop driver labels normally contain a masked phone, e.g.
         * "NAME - XXXXXXX858 - Not Registered". The visible suffix lets us tell
         * whether Mobile belongs to the selected driver without ever copying the
         * previous driver's full mobile number.
         */
        const masked = text.match(/(?:X|\*){2,}\s*(\d{2,4})\b/i);
        return masked ? masked[1] : "";
    }

    function driverMobileHint(match) {
        return mobileHintFromDriverLabel(match?.option?.label || "");
    }

    function mobileMatchesDriverHint(mobileInput, hint) {
        if (!hint) return true;
        if (!mobileInput) return false;

        const digits = String(mobileInput.value ?? "").replace(/\D+/g, "");
        return Boolean(digits) && digits.endsWith(hint);
    }

    function clearDependentTruckDriverValues() {
        const batInput = getBatInput();
        const driverSelect = getDriverSelect();
        const mobileInput = findMobileInput();

        /*
         * A rapid second FILL must not inherit BAT / Driver / Mobile from the first
         * FILL while OneStop's first async rego lookup is still returning.
         */
        if (batInput && clean(batInput.value)) {
            batInput.value = "";
            dispatch(batInput, "input");
            dispatch(batInput, "change");
        }

        if (driverSelect && driverSelect.value) {
            driverSelect.value = "";
            dispatch(driverSelect, "input");
            dispatch(driverSelect, "change");
        }

        if (mobileInput && String(mobileInput.value ?? "") !== "") {
            mobileInput.value = "";
            dispatch(mobileInput, "input");
            dispatch(mobileInput, "change");
        }
    }

    function retriggerCurrentRegoLookup(expectedRego, token) {
        if (token !== state.fillToken) return false;

        const liveRego = getRegoInput();
        if (!liveRego) return false;

        const current = upper(liveRego.value).replace(/\s+/g, "");
        if (current !== expectedRego) return false;

        dispatch(liveRego, "input");
        dispatch(liveRego, "change");

        try {
            window.stackRunInFullManifest?.txtRegoChanged?.(liveRego);
        } catch (_) {}

        try {
            window.stackRunOut?.txtRegoChanged?.(liveRego);
        } catch (_) {}

        /*
         * Patrick and DPW both use OneStop Truck/Rego controls, but the owning
         * page object is not guaranteed to have the same JavaScript name.
         * Native input/change + the real blur caused by TAB is therefore the
         * canonical trigger; the named callbacks above are only accelerators.
         */
        tabOutOfRego(
            liveRego
        );
        return true;
    }

    function manifestTruckDriverControlsReady() {
        const regoInput = getRegoInput();
        const truckType = getTruckTypeSelect();
        const driverSelect = getDriverSelect();

        if (!regoInput || !truckType || !driverSelect) {
            return false;
        }

        /*
         * OneStop can leave old hidden form nodes in the DOM while swapping AJAX
         * content. Require the controls to belong to a visible branch before treating
         * the manifest as already open.
         */
        return (
            isActuallyVisible(regoInput) ||
            isActuallyVisible(truckType) ||
            isActuallyVisible(driverSelect)
        );
    }

    function cancelManifestOpenWait(options = {}) {
        state.manifestOpenToken += 1;

        state.manifestWaitTimers.splice(0).forEach(timer => {
            try { clearTimeout(timer); } catch (_) {}
        });

        try {
            state.manifestWaitObserver?.disconnect();
        } catch (_) {}
        state.manifestWaitObserver = null;

        if (options.resetOpening !== false) {
            state.manifestOpening = false;
        }

        if (options.clearPending !== false) {
            state.pendingManifestEntry = null;
        }
    }

    function currentManifestLauncher() {
        /*
         * Known OneStop manifest controls first.
         */
        const knownIds = [
            "MANIFEST",
            "SRMManifestNewBtn",
            "Manifest",
            "manifest",
            "btnManifest",
            "ManifestBtn",
            "MANIFEST_BUTTON"
        ];

        for (
            const id of
            knownIds
        ) {
            const control =
                document.getElementById(
                    id
                );

            if (
                control &&
                !control.disabled &&
                isActuallyVisible(
                    control
                )
            ) {
                return control;
            }
        }

        /*
         * Patrick can expose Manifest from Booking / working-space pages instead
         * of DPW's StackRunReq.aspx. Search only genuine action controls so a
         * normal "Manifest List" navigation link is never clicked.
         */
        const activePane =
            Array.from(
                document.querySelectorAll(
                    '.ui-tabs-panel, [id^="StackRunTabs"], .ui-dialog, .modal, #Content'
                )
            ).find(node =>
                isActuallyVisible(
                    node
                )
            );

        const candidates =
            Array.from(
                (activePane || document)
                    .querySelectorAll(
                        'input[type="button"], input[type="submit"], button, a[role="button"], a[onclick]'
                    )
            );

        return candidates.find(control => {
            if (
                control.disabled ||
                !isActuallyVisible(
                    control
                )
            ) {
                return false;
            }

            const label =
                clean([
                    control.value,
                    control.textContent,
                    control.title,
                    control.getAttribute?.(
                        "aria-label"
                    )
                ].filter(Boolean).join(" "));

            if (!label) {
                return false;
            }

            if (
                /manifest\s+list|search\s+manifest|manifest\s+history/i.test(
                    label
                )
            ) {
                return false;
            }

            return (
                /^(?:continue\s+)?manifest(?:ing)?$/i.test(
                    label
                ) ||
                /^(?:continue\s+)?manifest(?:ing)?\s+(?:selected|bookings?|containers?)$/i.test(
                    label
                ) ||
                /^set\s+manifest(?:\s+details)?$/i.test(
                    label
                )
            );
        }) || null;
    }

    function waitForManifestThenFill(token) {
        const checkReady = () => {
            if (token !== state.manifestOpenToken) return false;
            if (!state.pendingManifestEntry) return false;
            if (!manifestTruckDriverControlsReady()) return false;

            const pending = state.pendingManifestEntry;

            state.manifestWaitTimers.splice(0).forEach(timer => {
                try { clearTimeout(timer); } catch (_) {}
            });
            try { state.manifestWaitObserver?.disconnect(); } catch (_) {}
            state.manifestWaitObserver = null;
            state.manifestOpening = false;
            state.pendingManifestEntry = null;

            /*
             * OneStop has created the controls; give its final binding pass a tiny
             * moment to finish, then start the normal V9 race-safe fill transaction.
             */
            const timer = setTimeout(() => {
                if (token !== state.manifestOpenToken) return;
                fillEntryIntoOpenManifest(pending);
            }, 90);
            state.manifestWaitTimers.push(timer);
            return true;
        };

        try {
            state.manifestWaitObserver?.disconnect();
        } catch (_) {}

        state.manifestWaitObserver = new MutationObserver(() => {
            checkReady();
        });

        try {
            state.manifestWaitObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["style", "class"]
            });
        } catch (_) {}

        /* Finite fallback checks in case OneStop changes only internal state. */
        [0, 80, 180, 350, 600, 950, 1400, 2100, 3000, 4200, 5600].forEach(delay => {
            const timer = setTimeout(checkReady, delay);
            state.manifestWaitTimers.push(timer);
        });

        const timeoutTimer = setTimeout(() => {
            if (token !== state.manifestOpenToken) return;
            if (manifestTruckDriverControlsReady()) {
                checkReady();
                return;
            }

            state.manifestOpening = false;
            state.pendingManifestEntry = null;
            try { state.manifestWaitObserver?.disconnect(); } catch (_) {}
            state.manifestWaitObserver = null;

            setMessage(
                "Manifest was opened, but the Truck/Driver form did not finish loading. Press FILL again.",
                "error"
            );
        }, 7000);
        state.manifestWaitTimers.push(timeoutTimer);

        checkReady();
    }

    function fillEntry(entry) {
        if (!entry) return;

        /* If Manifest is already open, do not touch the Manifest button. */
        if (manifestTruckDriverControlsReady()) {
            cancelManifestOpenWait();
            fillEntryIntoOpenManifest(entry);
            return;
        }

        /*
         * A FILL while the manifest is still opening replaces the pending driver.
         * The latest click wins, but we do NOT click Manifest a second time.
         */
        const alreadyOpening = state.manifestOpening;

        state.manifestWaitTimers.splice(0).forEach(timer => {
            try { clearTimeout(timer); } catch (_) {}
        });
        try { state.manifestWaitObserver?.disconnect(); } catch (_) {}
        state.manifestWaitObserver = null;

        state.manifestOpenToken += 1;
        const token = state.manifestOpenToken;
        state.pendingManifestEntry = entry;

        /* Kill any old truck/driver race transaction before opening a fresh manifest. */
        cancelAddContainerPreserve();
        clearFillEnforcement();

        if (!alreadyOpening) {
            const launcher = currentManifestLauncher();
            if (!launcher) {
                state.pendingManifestEntry = null;
                setMessage(
                    `${TERMINAL.label}: I could not find a visible OneStop Manifest action yet. Open/select the booking(s) you want to manifest, then press FILL again.`,
                    "error"
                );
                return;
            }

            state.manifestOpening = true;
            setMessage(
                `Opening Manifest automatically for ${entry.name}…`,
                "success"
            );

            try {
                launcher.click();
            } catch (_) {
                try {
                    launcher.dispatchEvent(new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                } catch (_) {}
            }
        } else {
            setMessage(
                `Manifest is opening… switched pending FILL to ${entry.name}.`,
                "success"
            );
        }

        waitForManifestThenFill(token);
    }

    function fillEntryIntoOpenManifest(
        entry
    ) {
        const regoInput = getRegoInput();
        const truckType = getTruckTypeSelect();
        const driverSelect = getDriverSelect();

        if (!regoInput || !truckType || !driverSelect) {
            setMessage(
                `${TERMINAL.label}: Truck/Driver controls are not available on the current OneStop manifest view yet.`,
                "error"
            );
            return;
        }

        const match = findDriverMatch(entry.name);

        /*
         * V9 TRANSACTION RULE:
         * A new FILL owns the form. Everything belonging to an older helper FILL is
         * cancelled BEFORE the new rego is written. This fixes wrong-first / right-second
         * clicks where V8 could still learn or restore the first driver's Mobile.
         */
        cancelAddContainerPreserve();
        clearFillEnforcement();
        const token = state.fillToken;

        state.lastFill = {
            rego: entry.rego,
            truckType: "ADOUBLE",
            driverValue: match.status === "matched" ? match.option.value : "",
            driverName: match.status === "matched" ? match.option.name : "",
            mobileValue: null
        };

        let userInterrupted = false;
        let firstDriverCommitDone = false;
        let regoRetryCount = 0;
        const mobileHint = driverMobileHint(match);

        const protectedIds = new Set([
            "SelectTruckRegoForm___TRUCK_REGO_NO",
            "SelectTruckRegoForm___BAT",
            "IDTRUCKTYPE",
            "CHMSIC"
        ]);

        const onUserActivity = event => {
            if (!event?.isTrusted) return;

            const target = event.target;
            if (!target) return;

            const isMobile = target === findMobileInput();
            if (!protectedIds.has(target.id) && !isMobile) return;

            userInterrupted = true;
            clearFillEnforcement();
        };

        document.addEventListener("pointerdown", onUserActivity, true);
        document.addEventListener("keydown", onUserActivity, true);
        document.addEventListener("input", onUserActivity, true);
        document.addEventListener("change", onUserActivity, true);

        state.activeFillCleanup = () => {
            document.removeEventListener("pointerdown", onUserActivity, true);
            document.removeEventListener("keydown", onUserActivity, true);
            document.removeEventListener("input", onUserActivity, true);
            document.removeEventListener("change", onUserActivity, true);
        };

        /* Remove anything left visibly committed by the previous FILL. */
        clearDependentTruckDriverValues();

        regoInput.value = entry.rego;
        dispatch(regoInput, "input");
        dispatch(regoInput, "change");

        try {
            window.stackRunInFullManifest?.txtRegoChanged?.(regoInput);
        } catch (_) {}

        try {
            window.stackRunOut?.txtRegoChanged?.(regoInput);
        } catch (_) {}

        /* Real TAB: Rego -> BAT starts OneStop's own truck lookup. */
        tabOutOfRego(regoInput);

        const ensureCurrentFill = (options = {}) => {
            if (token !== state.fillToken || userInterrupted) return false;

            const liveRego = getRegoInput();
            const liveBat = getBatInput();
            const liveDriver = getDriverSelect();
            const liveMobile = findMobileInput();

            if (!liveRego || !liveDriver) return false;

            const currentRego = upper(liveRego.value).replace(/\s+/g, "");
            if (currentRego !== entry.rego) return false;

            setTruckTypeADouble();

            /*
             * If BAT is still empty after OneStop has had time to answer, kick ONLY
             * the CURRENT rego lookup again. This is finite (max 2 retries), not polling.
             */
            if (
                options.allowRegoRetry &&
                liveBat &&
                !clean(liveBat.value) &&
                regoRetryCount < 2
            ) {
                regoRetryCount += 1;
                retriggerCurrentRegoLookup(entry.rego, token);
                return false;
            }

            if (options.deferDriverCommit) {
                return true;
            }

            if (match.status !== "matched") {
                clearDriverOption();
                return true;
            }

            const beforeDriver = liveDriver.value || "";
            const driverWasWrong = beforeDriver !== match.option.value;
            const mobileLooksWrong = Boolean(
                mobileHint && !mobileMatchesDriverHint(liveMobile, mobileHint)
            );

            /*
             * IMPORTANT: never restore a remembered Mobile value during FILL.
             * If Driver/Mobile looks stale, re-commit the CURRENT driver and TAB to
             * Mobile so OneStop itself generates the correct Mobile for that driver.
             */
            const mustCommitDriver = Boolean(
                !firstDriverCommitDone ||
                driverWasWrong ||
                mobileLooksWrong ||
                options.forceDriverCommit
            );

            if (mustCommitDriver) {
                const result = setDriverOption(match);
                if (result.ok && result.select?.value === match.option.value) {
                    /*
                     * When the select already has the right value, force its real
                     * lifecycle anyway; it may only LOOK right while Mobile is stale.
                     */
                    if (!result.changed) {
                        dispatch(result.select, "input");
                        dispatch(result.select, "change");
                    }

                    tabOutOfDriver(result.select);
                    firstDriverCommitDone = true;
                }
            }

            /* Store Mobile only for Add Container once it agrees with the driver's hint. */
            const currentMobile = findMobileInput();
            if (
                state.lastFill?.rego === entry.rego &&
                currentMobile &&
                mobileMatchesDriverHint(currentMobile, mobileHint)
            ) {
                state.lastFill.mobileValue = String(currentMobile.value ?? "");
            }

            return true;
        };

        state.activeFillEnsure = ensureCurrentFill;

        /*
         * First driver commit is deliberately not immediate. The short delay gives a
         * stale response from a wrong first FILL a chance to land BEFORE V9 commits the
         * correct driver. Later passes repair any even-later OneStop callback.
         */
        const passes = [
            { delay: 180,  allowRegoRetry: false, deferDriverCommit: true },
            { delay: 500,  allowRegoRetry: false },
            { delay: 900,  allowRegoRetry: true  },
            { delay: 1400, allowRegoRetry: false },
            { delay: 2100, allowRegoRetry: true  },
            { delay: 3200, allowRegoRetry: false },
            { delay: 4700, allowRegoRetry: false },
            { delay: 6500, allowRegoRetry: false }
        ];

        passes.forEach(pass => {
            const timer = setTimeout(
                () => ensureCurrentFill(pass),
                pass.delay
            );
            state.fillTimers.push(timer);
        });

        /* Final cleanup: no old transaction listeners are left behind. */
        const cleanupTimer = setTimeout(() => {
            if (token !== state.fillToken) return;

            const cleanupActive = state.activeFillCleanup;
            state.activeFillCleanup = null;
            state.activeFillEnsure = null;
            if (cleanupActive) {
                try { cleanupActive(); } catch (_) {}
            }
        }, 7100);
        state.fillTimers.push(cleanupTimer);

        if (match.status === "matched") {
            setMessage(
                `FILLING: ${entry.rego} • Rego→BAT • A-Double • ${match.option.name} • Driver→Mobile (V13 persistent)`,
                "success"
            );
        } else if (match.status === "ambiguous") {
            setMessage(
                `Rego + A-Double filling for ${entry.name}. Multiple OneStop driver matches found, so Driver will stay cleared — select the correct Driver manually.`,
                "warn"
            );
        } else {
            setMessage(
                `Rego + A-Double filling for ${entry.name}. No safe OneStop Driver match found, so Driver will stay cleared — select Driver manually.`,
                "warn"
            );
        }

        regoInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function filteredEntries() {
        const query =
            normaliseName(
                state.query
            );

        const regoQuery =
            upper(
                state.query
            ).replace(
                /\s+/g,
                ""
            );

        return state.entries
            .filter(
                entry =>
                    !state.currentOnly ||
                    entry.current
            )
            .filter(
                entry => {
                    if (!query) {
                        return true;
                    }

                    return (
                        normaliseName(
                            entry.name
                        ).includes(
                            query
                        ) ||
                        entry.rego.includes(
                            regoQuery
                        )
                    );
                }
            )
            .slice(
                0,
                12
            );
    }

    function setMessage(
        message,
        type = "info"
    ) {
        const node =
            document.getElementById(
                `${PANEL_ID}-message`
            );

        if (!node) {
            return;
        }

        node.textContent =
            message;

        node.setAttribute(
            "data-type",
            type
        );
    }

    function resultsHtml() {
        if (!state.entries.length) {
            return `<div class="jamie-driver-empty">Paste Excel rows or add a driver manually to begin.</div>`;
        }

        const entries = filteredEntries();
        if (!entries.length) {
            return `<div class="jamie-driver-empty">No matching driver/regos.</div>`;
        }

        return entries.map(entry => {
            const match = findDriverMatch(entry.name);
            const matchText = match.status === "matched"
                ? "ONESTOP ✓"
                : match.status === "ambiguous"
                    ? `${match.candidates.filter(candidate => candidate.score >= 999).length || match.candidates.length} MATCHES`
                    : "NO MATCH";
            const key = encodeURIComponent(entryNameKey(entry));

            return `
                <div class="jamie-driver-result" data-current="${entry.current ? "true" : "false"}">
                    <div class="jamie-driver-result-main">
                        <div class="jamie-driver-rego">${escapeHtml(entry.rego)}</div>
                        <div class="jamie-driver-name">${escapeHtml(entry.name)}</div>
                        <div class="jamie-driver-meta">
                            <span class="jamie-driver-current">${entry.current ? "TODAY" : "OLDER"}</span>
                            <span class="jamie-driver-match" data-match="${match.status}">${matchText}</span>
                        </div>
                    </div>
                    <div class="jamie-driver-row-actions">
                        <button type="button" class="jamie-driver-fill" data-fill-key="${key}">FILL</button>
                        <button type="button" class="jamie-driver-edit" data-edit-key="${key}">EDIT</button>
                        <button type="button" class="jamie-driver-remove" data-remove-key="${key}" title="Remove ${escapeHtml(entry.name)}">×</button>
                    </div>
                </div>`;
        }).join("");
    }

    function isActuallyVisible(element) {
        if (!element || !(element instanceof HTMLElement)) return false;

        try {
            const style = getComputedStyle(element);
            if (style.display === "none" || style.visibility === "hidden") return false;
        } catch (_) {}

        return Boolean(
            element.offsetParent !== null ||
            element.getClientRects?.().length
        );
    }

    const SIDE_DOCK_GAP = 18;
    const SIDE_DOCK_VIEWPORT_LEFT_RATIO = 0.72;
    const SIDE_DOCK_RIGHT_MARGIN = 18;
    const SIDE_DOCK_MAX_WIDTH = 455;
    const SIDE_DOCK_MIN_WIDTH = 360;

    function exactVisibleTextElement(text) {
        const wanted = clean(text);
        const selectors = "h1,h2,h3,h4,h5,h6,legend,strong,b,span,div,td";

        try {
            return Array.from(document.querySelectorAll(selectors)).find(element => {
                if (!isActuallyVisible(element)) return false;
                if (element.children?.length) return false;
                return clean(element.textContent) === wanted;
            }) || null;
        } catch (_) {
            return null;
        }
    }

    function getSideDockGeometry() {
        const form = getManifestForm();
        const holder = getTruckDriverHolder();

        if (!isActuallyVisible(form) && !isActuallyVisible(holder)) {
            return null;
        }

        const visibleControls = [
            getRegoInput(),
            getBatInput(),
            getTruckTypeSelect(),
            getDriverSelect(),
            form
        ].filter(isActuallyVisible);

        const rects = visibleControls.map(element => element.getBoundingClientRect());
        if (!rects.length) return null;

        const left = Math.min(...rects.map(rect => rect.left));
        let contentRight = Math.max(...rects.map(rect => rect.right));

        /*
         * Some OneStop wrappers stretch across nearly the whole page even though
         * the actual controls only occupy the left side. Ignore a giant form rect
         * so the helper docks beside the visible fields instead of off-screen.
         */
        const controlRects = visibleControls
            .filter(element => element !== form)
            .map(element => element.getBoundingClientRect());

        if (controlRects.length) {
            const actualControlRight = Math.max(...controlRects.map(rect => rect.right));
            if (contentRight - actualControlRight > 180) {
                contentRight = actualControlRight;
            }
        }

        const viewportWidth = Math.max(
            document.documentElement?.clientWidth || 0,
            window.innerWidth || 0
        );

        const naturalPanelLeft = contentRight + SIDE_DOCK_GAP;
        const desiredRightSideLeft = Math.round(viewportWidth * SIDE_DOCK_VIEWPORT_LEFT_RATIO);
        const panelLeft = Math.max(naturalPanelLeft, desiredRightSideLeft);
        const available = viewportWidth - panelLeft - SIDE_DOCK_RIGHT_MARGIN;

        if (available < SIDE_DOCK_MIN_WIDTH) {
            return null;
        }

        const manifestHeading =
            exactVisibleTextElement(
                "Set Manifest Details"
            ) ||
            exactVisibleTextElement(
                "Manifest Details"
            );
        const truckHeading =
            exactVisibleTextElement(
                "Select Truck & Driver"
            ) ||
            exactVisibleTextElement(
                "Truck & Driver"
            );
        const anchorRect = (holder && isActuallyVisible(holder))
            ? holder.getBoundingClientRect()
            : form.getBoundingClientRect();

        let panelTop = anchorRect.top;

        if (manifestHeading) {
            const headingRect = manifestHeading.getBoundingClientRect();
            if (
                headingRect.top <= anchorRect.top &&
                anchorRect.top - headingRect.top < 260
            ) {
                panelTop = headingRect.top;
            }
        } else if (truckHeading) {
            const headingRect = truckHeading.getBoundingClientRect();
            panelTop = Math.max(8, headingRect.top - 84);
        } else {
            panelTop = Math.max(8, anchorRect.top - 105);
        }

        return {
            left: Math.max(left + 280, panelLeft) + window.scrollX,
            top: panelTop + window.scrollY,
            width: Math.min(SIDE_DOCK_MAX_WIDTH, available)
        };
    }

    function resetPanelPositionStyles(panel) {
        [
            "position",
            "left",
            "right",
            "top",
            "width",
            "max-height",
            "z-index",
            "margin"
        ].forEach(property => {
            try { panel.style.removeProperty(property); } catch (_) {}
        });
    }

    function preferredMountTarget() {
        const form = getManifestForm();
        const holder = getTruckDriverHolder();
        const sideGeometry = getSideDockGeometry();

        if (sideGeometry) {
            return {
                target: document.body,
                mode: "side",
                geometry: sideGeometry
            };
        }

        if (form && isActuallyVisible(form)) {
            return { target: form, mode: "inline", geometry: null };
        }

        if (holder && isActuallyVisible(holder)) {
            return { target: holder, mode: "inline", geometry: null };
        }

        /*
         * OneStop can build this manifest form asynchronously or temporarily
         * hide the owning tab during redraws. Keep the helper visible anyway.
         */
        return { target: document.body, mode: "floating", geometry: null };
    }

    function placePanel(panel) {
        if (!panel || !document.body) return false;

        const mount = preferredMountTarget();

        if (mount.mode === "side" && mount.geometry) {
            if (panel.parentElement !== document.body) {
                document.body.appendChild(panel);
            }

            panel.dataset.mountMode = "side";
            panel.style.setProperty("position", "absolute", "important");
            panel.style.setProperty("left", `${Math.round(mount.geometry.left)}px`, "important");
            panel.style.setProperty("top", `${Math.round(mount.geometry.top)}px`, "important");
            panel.style.setProperty("right", "auto", "important");
            panel.style.setProperty("width", `${Math.round(mount.geometry.width)}px`, "important");
            panel.style.setProperty("margin", "0", "important");
            panel.style.setProperty("z-index", "5000", "important");
            return true;
        }

        resetPanelPositionStyles(panel);
        panel.dataset.mountMode = mount.mode;

        if (mount.mode === "inline" && mount.target) {
            if (panel.previousElementSibling !== mount.target) {
                mount.target.insertAdjacentElement("afterend", panel);
            }
        } else if (panel.parentElement !== document.body) {
            document.body.appendChild(panel);
        }

        return true;
    }

    function renderPanel() {
        if (!document.body) return false;

        let panel = document.getElementById(PANEL_ID);
        if (!panel) {
            panel = document.createElement("div");
            panel.id = PANEL_ID;
            document.body.appendChild(panel);
        }

        placePanel(panel);

        panel.classList.toggle(
            "jamie-driver-minimized",
            Boolean(
                state.minimized
            )
        );

        const currentCount = state.entries.filter(entry => entry.current).length;
        panel.innerHTML = `
            <div class="jamie-driver-head">
                <div>
                    <div class="jamie-driver-title">DRIVER REGO HELPER — ${escapeHtml(TERMINAL.label)}</div>
                    <div class="jamie-driver-subtitle">${state.entries.length ? `${state.entries.length} loaded • ${currentCount} current • DPW + PATRICK SHARED` : "Paste Excel / add manually • shared between DPW + Patrick"}</div>
                </div>
                <div class="jamie-driver-head-actions">
                    <button type="button" id="${PANEL_ID}-toggle-import">PASTE / ADD</button>
                    <button type="button" id="${PANEL_ID}-toggle-manual">+ MANUAL</button>
                    <button type="button" id="${PANEL_ID}-clear" ${state.entries.length ? "" : "disabled"}>CLEAR ALL</button>
                    <button
                        type="button"
                        id="${PANEL_ID}-minimize"
                        class="jamie-driver-minimize"
                        title="${state.minimized ? "Restore Driver Rego Helper" : "Minimize Driver Rego Helper"}"
                        aria-label="${state.minimized ? "Restore Driver Rego Helper" : "Minimize Driver Rego Helper"}"
                    >${state.minimized ? "+" : "−"}</button>
                </div>
            </div>

            <div class="jamie-driver-import" id="${PANEL_ID}-import" ${state.importOpen ? "" : "hidden"}>
                <textarea id="${PANEL_ID}-paste" rows="4" placeholder="Copy any Rego + Driver Name rows from Excel and Ctrl+V here. Each new paste ADDS / UPDATES — it does not wipe the old list."></textarea>
                <div class="jamie-driver-import-actions">
                    <button type="button" id="${PANEL_ID}-import-text">ADD / UPDATE TEXT</button>
                    <span>Paste repeatedly. Same driver = rego updated; new driver = added. Use CLEAR ALL if you want to start fresh.</span>
                </div>
            </div>

            <div class="jamie-driver-manual" id="${PANEL_ID}-manual" ${state.manualOpen ? "" : "hidden"}>
                <input id="${PANEL_ID}-manual-rego" type="text" maxlength="9" value="${escapeHtml(state.manualRego)}" placeholder="Rego e.g. JMP130">
                <input id="${PANEL_ID}-manual-name" type="text" value="${escapeHtml(state.manualName)}" placeholder="Driver name e.g. Dev Kumar">
                <label class="jamie-driver-current-toggle"><input type="checkbox" id="${PANEL_ID}-manual-current" ${state.manualCurrent ? "checked" : ""}> TODAY</label>
                <button type="button" id="${PANEL_ID}-manual-save">${state.editingKey ? "SAVE EDIT" : "ADD / UPDATE"}</button>
            </div>

            <div class="jamie-driver-controls">
                <input id="${PANEL_ID}-search" type="text" value="${escapeHtml(state.query)}" placeholder="Search driver or rego..." ${state.entries.length ? "" : "disabled"}>
                <label class="jamie-driver-current-toggle"><input type="checkbox" id="${PANEL_ID}-current-only" ${state.currentOnly ? "checked" : ""} ${state.entries.length ? "" : "disabled"}> TODAY ONLY</label>
            </div>

            <div class="jamie-driver-results" id="${PANEL_ID}-results">${resultsHtml()}</div>
            <div class="jamie-driver-message" id="${PANEL_ID}-message" data-type="info">${state.entries.length ? "Choose a driver and press FILL. You can paste more drivers at any time." : "Waiting for drivers."}</div>
        `;

        bindPanelEvents(panel);
        return true;
    }

    function findEntryByEncodedKey(encodedKey) {
        let key = "";
        try { key = decodeURIComponent(encodedKey || ""); } catch (_) { key = encodedKey || ""; }
        return state.entries.find(entry => entryNameKey(entry) === key) || null;
    }

    function refreshResultsOnly(panel) {
        const results = panel.querySelector(`#${PANEL_ID}-results`);
        if (results) {
            results.innerHTML = resultsHtml();
            bindRowButtons(results);
        }
    }

    function bindPanelEvents(panel) {
        panel.querySelector(`#${PANEL_ID}-minimize`)?.addEventListener("click", () => {
            state.minimized =
                !state.minimized;

            renderPanel();
        });

        panel.querySelector(`#${PANEL_ID}-toggle-import`)?.addEventListener("click", () => {
            state.importOpen = !state.importOpen;
            renderPanel();
            if (state.importOpen) setTimeout(() => document.getElementById(`${PANEL_ID}-paste`)?.focus(), 0);
        });

        panel.querySelector(`#${PANEL_ID}-toggle-manual`)?.addEventListener("click", () => {
            state.manualOpen = !state.manualOpen;
            if (!state.manualOpen) { state.manualRego = ""; state.manualName = ""; state.editingKey = ""; }
            renderPanel();
            if (state.manualOpen) setTimeout(() => document.getElementById(`${PANEL_ID}-manual-rego`)?.focus(), 0);
        });

        panel.querySelector(`#${PANEL_ID}-paste`)?.addEventListener("paste", event => {
            const clipboard = event.clipboardData;
            if (!clipboard) return;
            const plain = clipboard.getData("text/plain");
            const html = clipboard.getData("text/html");
            if (!plain && !html) return;
            event.preventDefault();
            importClipboard(plain, html, { replaceAll: false });
        });

        panel.querySelector(`#${PANEL_ID}-import-text`)?.addEventListener("click", () => {
            const textarea = panel.querySelector(`#${PANEL_ID}-paste`);
            importClipboard(textarea?.value || "", "", { replaceAll: false });
        });


        panel.querySelector(`#${PANEL_ID}-manual-save`)?.addEventListener("click", () => {
            const regoInput = panel.querySelector(`#${PANEL_ID}-manual-rego`);
            const nameInput = panel.querySelector(`#${PANEL_ID}-manual-name`);
            const currentInput = panel.querySelector(`#${PANEL_ID}-manual-current`);
            const rego = upper(regoInput?.value).replace(/\s+/g, "");
            const name = clean(nameInput?.value);
            if (!looksLikeRego(rego) || !looksLikeDriverName(name)) {
                setMessage("Enter a valid rego and driver name.", "error");
                return;
            }
            const newKey = normaliseName(name);
            const existing = state.entries.some(entry => entryNameKey(entry) === newKey);

            if (state.editingKey && state.editingKey !== newKey) {
                state.entries = state.entries.filter(entry => entryNameKey(entry) !== state.editingKey);
            }

            mergeEntries([{ rego, name, current: Boolean(currentInput?.checked) }], { source: "manual" });
            state.manualRego = ""; state.manualName = ""; state.manualCurrent = true; state.manualOpen = false; state.editingKey = "";
            renderPanel();
            setMessage(existing ? `${name} updated.` : `${name} added.`, "success");
        });

        panel.querySelector(`#${PANEL_ID}-clear`)?.addEventListener("click", () => {
            if (!state.entries.length) return;
            if (!confirm(`Clear all ${state.entries.length} saved drivers?`)) return;
            state.entries = []; state.query = ""; state.currentOnly = false; state.importedAt = null; state.greenSignalsDetected = false; state.editingKey = "";
            clearPersistentData();
            renderPanel();
        });

        const search = panel.querySelector(`#${PANEL_ID}-search`);
        search?.addEventListener("input", () => { state.query = search.value; refreshResultsOnly(panel); });
        search?.addEventListener("keydown", event => {
            if (event.key !== "Enter") return;
            const entries = filteredEntries();
            if (entries.length === 1) { event.preventDefault(); fillEntry(entries[0]); }
        });

        panel.querySelector(`#${PANEL_ID}-current-only`)?.addEventListener("change", event => {
            state.currentOnly = Boolean(event.currentTarget.checked);
            refreshResultsOnly(panel);
        });

        bindRowButtons(panel);
    }

    function bindRowButtons(root) {
        root.querySelectorAll("[data-fill-key]").forEach(button => {
            button.addEventListener("click", () => {
                const entry = findEntryByEncodedKey(button.getAttribute("data-fill-key"));
                if (entry) fillEntry(entry);
            });
        });

        root.querySelectorAll("[data-edit-key]").forEach(button => {
            button.addEventListener("click", () => {
                const entry = findEntryByEncodedKey(button.getAttribute("data-edit-key"));
                if (!entry) return;
                state.manualRego = entry.rego;
                state.manualName = entry.name;
                state.manualCurrent = Boolean(entry.current);
                state.editingKey = entryNameKey(entry);
                state.manualOpen = true;
                renderPanel();
                setTimeout(() => document.getElementById(`${PANEL_ID}-manual-rego`)?.focus(), 0);
            });
        });

        root.querySelectorAll("[data-remove-key]").forEach(button => {
            button.addEventListener("click", () => {
                const entry = findEntryByEncodedKey(button.getAttribute("data-remove-key"));
                if (!entry) return;
                removeEntryByName(entry.name);
                renderPanel();
                setMessage(`${entry.name} removed.`, "success");
            });
        });
    }

    function installStyle() {
        if (
            document.getElementById(
                STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            STYLE_ID;

        style.textContent = `
            #${PANEL_ID},
            #${PANEL_ID} * {
                box-sizing: border-box !important;
                font-family: Arial, sans-serif !important;
            }

            #${PANEL_ID} {
                width: min(455px, calc(100% - 12px)) !important;
                margin: 8px 0 12px 6px !important;
                overflow: hidden !important;
                border: 1px solid #94a3b8 !important;
                border-left: 4px solid #16a34a !important;
                border-radius: 5px !important;
                background: #ffffff !important;
                color: #334155 !important;
                box-shadow: 0 2px 8px rgba(15, 23, 42, .10) !important;
            }

            #${PANEL_ID}[data-mount-mode="side"] {
                max-height: min(680px, calc(100vh - 95px)) !important;
                overflow: hidden !important;
                box-shadow: 0 4px 16px rgba(15, 23, 42, .14) !important;
            }

            #${PANEL_ID}[data-mount-mode="floating"] {
                position: fixed !important;
                top: 155px !important;
                right: 14px !important;
                z-index: 2147483200 !important;
                width: min(455px, calc(100vw - 28px)) !important;
                max-height: min(700px, calc(100vh - 100px)) !important;
                overflow: auto !important;
                margin: 0 !important;
                box-shadow: 0 8px 28px rgba(15, 23, 42, .22) !important;
            }

            #${PANEL_ID} .jamie-driver-head {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 6px !important;
                min-height: 34px !important;
                padding: 4px 6px !important;
                border-bottom: 1px solid #e2e8f0 !important;
                background: #f8fafc !important;
            }

            #${PANEL_ID} .jamie-driver-title {
                color: #166534 !important;
                font-size: 9px !important;
                font-weight: 900 !important;
                line-height: 11px !important;
            }

            #${PANEL_ID} .jamie-driver-subtitle {
                margin-top: 2px !important;
                color: #64748b !important;
                font-size: 7px !important;
                font-weight: 800 !important;
            }

            #${PANEL_ID} .jamie-driver-head-actions { display: flex !important; flex-wrap: wrap !important; justify-content: flex-end !important; gap: 3px !important; }

            #${PANEL_ID} button {
                min-height: 23px !important;
                padding: 3px 6px !important;
                border: 1px solid #16a34a !important;
                border-radius: 4px !important;
                background: #16a34a !important;
                color: #ffffff !important;
                font-size: 7px !important;
                font-weight: 900 !important;
                cursor: pointer !important;
            }

            #${PANEL_ID} button:hover {
                background: #15803d !important;
            }

            #${PANEL_ID} button:disabled {
                opacity: .4 !important;
                cursor: default !important;
            }

            #${PANEL_ID} #${PANEL_ID}-clear {
                border-color: #94a3b8 !important;
                background: #64748b !important;
            }

            #${PANEL_ID} .jamie-driver-minimize {
                width: 23px !important;
                min-width: 23px !important;
                max-width: 23px !important;
                height: 23px !important;
                min-height: 23px !important;
                padding: 0 !important;
                border-color: #64748b !important;
                border-radius: 4px !important;
                background: #475569 !important;
                color: #ffffff !important;
                font-size: 14px !important;
                font-weight: 900 !important;
                line-height: 19px !important;
                text-align: center !important;
            }

            #${PANEL_ID} .jamie-driver-minimize:hover {
                background: #334155 !important;
            }

            /*
             * V15 MINIMIZED MODE
             * Keep only the top header visible. The square +/- button remains
             * at the far right so the helper can be restored instantly.
             */
            #${PANEL_ID}.jamie-driver-minimized > :not(.jamie-driver-head) {
                display: none !important;
            }

            #${PANEL_ID}.jamie-driver-minimized .jamie-driver-head {
                border-bottom: 0 !important;
            }

            #${PANEL_ID} .jamie-driver-import {
                padding: 5px 6px !important;
                border-bottom: 1px solid #dbe3ea !important;
                background: #f0fdf4 !important;
            }

            #${PANEL_ID} .jamie-driver-import[hidden] { display: none !important; }

            #${PANEL_ID} .jamie-driver-manual {
                display: grid !important;
                grid-template-columns: 82px minmax(130px, 1fr) auto auto !important;
                align-items: center !important;
                gap: 4px !important;
                padding: 5px 6px !important;
                border-bottom: 1px solid #dbe3ea !important;
                background: #eff6ff !important;
            }
            #${PANEL_ID} .jamie-driver-manual[hidden] { display: none !important; }
            #${PANEL_ID} .jamie-driver-manual > input[type="text"] { min-width: 0 !important; height: 25px !important; padding: 3px 5px !important; border: 1px solid #93c5fd !important; border-radius: 4px !important; background: #ffffff !important; color: #1e293b !important; font-size: 9px !important; font-weight: 800 !important; }
            #${PANEL_ID} .jamie-driver-secondary { border-color: #64748b !important; background: #64748b !important; }

            #${PANEL_ID} textarea {
                width: 100% !important;
                min-height: 56px !important;
                resize: vertical !important;
                padding: 5px !important;
                border: 1px solid #86efac !important;
                border-radius: 4px !important;
                background: #ffffff !important;
                color: #334155 !important;
                font-family: Consolas, monospace !important;
                font-size: 9px !important;
            }

            #${PANEL_ID} .jamie-driver-import-actions {
                display: flex !important;
                align-items: center !important;
                gap: 5px !important;
                margin-top: 3px !important;
                color: #64748b !important;
                font-size: 7px !important;
                font-weight: 700 !important;
            }

            #${PANEL_ID} .jamie-driver-controls {
                display: flex !important;
                align-items: center !important;
                gap: 5px !important;
                padding: 5px 6px !important;
                border-bottom: 1px solid #e2e8f0 !important;
                background: #ffffff !important;
            }

            #${PANEL_ID} .jamie-driver-controls > input[type="text"] {
                flex: 1 1 auto !important;
                min-width: 160px !important;
                height: 25px !important;
                padding: 3px 5px !important;
                border: 1px solid #94a3b8 !important;
                border-radius: 4px !important;
                background: #ffffff !important;
                color: #1e293b !important;
                font-size: 8px !important;
                font-weight: 800 !important;
            }

            #${PANEL_ID} .jamie-driver-current-toggle {
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
                color: #166534 !important;
                font-size: 7px !important;
                font-weight: 900 !important;
                white-space: nowrap !important;
            }

            #${PANEL_ID} .jamie-driver-results {
                max-height: min(455px, calc(100vh - 245px)) !important;
                overflow-y: auto !important;
                padding: 4px !important;
                background: #f8fafc !important;
            }

            #${PANEL_ID}[data-mount-mode="side"] .jamie-driver-results {
                max-height: min(500px, calc(100vh - 225px)) !important;
            }

            #${PANEL_ID} .jamie-driver-result {
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) auto !important;
                align-items: center !important;
                gap: 4px !important;
                min-height: 34px !important;
                margin-bottom: 5px !important;
                padding: 4px 4px !important;
                border: 1px solid #cbd5e1 !important;
                border-left: 3px solid #94a3b8 !important;
                border-radius: 4px !important;
                background: #ffffff !important;
            }

            #${PANEL_ID} .jamie-driver-result[data-current="true"] {
                border-color: #86efac !important;
                border-left-color: #16a34a !important;
                background: #f0fdf4 !important;
            }

            #${PANEL_ID} .jamie-driver-result-main {
                min-width: 0 !important;
                display: grid !important;
                grid-template-columns: 62px minmax(0, 1fr) auto !important;
                align-items: center !important;
                gap: 4px !important;
            }

            #${PANEL_ID} .jamie-driver-rego {
                color: #475569 !important;
                font-size: 8.5px !important;
                font-weight: 900 !important;
                letter-spacing: .15px !important;
                white-space: nowrap !important;
            }

            #${PANEL_ID} .jamie-driver-name {
                overflow: hidden !important;
                min-height: 24px !important;
                padding: 4px 6px !important;
                border: 1px solid #bfdbfe !important;
                border-radius: 4px !important;
                background: #eff6ff !important;
                color: #0f172a !important;
                font-size: 10px !important;
                font-weight: 900 !important;
                line-height: 14px !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }

            #${PANEL_ID} .jamie-driver-meta {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-end !important;
                gap: 1px !important;
                white-space: nowrap !important;
            }

            #${PANEL_ID} .jamie-driver-current {
                color: #16a34a !important;
                font-size: 5.5px !important;
                font-weight: 900 !important;
            }

            #${PANEL_ID} .jamie-driver-match {
                color: #64748b !important;
                font-size: 5.5px !important;
                font-weight: 900 !important;
            }

            #${PANEL_ID} .jamie-driver-match[data-match="ambiguous"] {
                color: #b45309 !important;
            }

            #${PANEL_ID} .jamie-driver-match[data-match="none"] {
                color: #dc2626 !important;
            }

            #${PANEL_ID} .jamie-driver-row-actions {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
                gap: 3px !important;
                white-space: nowrap !important;
            }

            #${PANEL_ID} .jamie-driver-fill {
                width: 42px !important;
                min-width: 42px !important;
                border-color: #2563eb !important;
                background: #2563eb !important;
                color: #ffffff !important;
            }

            #${PANEL_ID} .jamie-driver-fill:hover {
                border-color: #1d4ed8 !important;
                background: #1d4ed8 !important;
            }

            #${PANEL_ID} .jamie-driver-edit { width: 35px !important; min-width: 35px !important; border-color: #64748b !important; background: #64748b !important; }
            #${PANEL_ID} .jamie-driver-remove { width: 24px !important; min-width: 24px !important; padding: 2px !important; border-color: #dc2626 !important; background: #dc2626 !important; font-size: 11px !important; line-height: 15px !important; }

            #${PANEL_ID} .jamie-driver-empty {
                padding: 8px 6px !important;
                color: #64748b !important;
                font-size: 9px !important;
                font-weight: 800 !important;
                text-align: center !important;
            }

            #${PANEL_ID} .jamie-driver-message {
                min-height: 23px !important;
                padding: 5px 6px !important;
                border-top: 1px solid #e2e8f0 !important;
                background: #ffffff !important;
                color: #64748b !important;
                font-size: 7px !important;
                font-weight: 800 !important;
            }

            #${PANEL_ID} .jamie-driver-message[data-type="success"] {
                background: #f0fdf4 !important;
                color: #15803d !important;
            }

            #${PANEL_ID} .jamie-driver-message[data-type="warn"] {
                background: #fffbeb !important;
                color: #a16207 !important;
            }

            #${PANEL_ID} .jamie-driver-message[data-type="error"] {
                background: #fef2f2 !important;
                color: #b91c1c !important;
            }

            @media (max-width: 760px) {
                #${PANEL_ID} .jamie-driver-head { align-items: stretch !important; flex-direction: column !important; }
                #${PANEL_ID} .jamie-driver-head-actions { justify-content: flex-start !important; }
                #${PANEL_ID} .jamie-driver-manual { grid-template-columns: 1fr !important; }
                #${PANEL_ID} .jamie-driver-result { grid-template-columns: 1fr !important; }
                #${PANEL_ID} .jamie-driver-row-actions { justify-content: flex-start !important; }
            }
        `;

        document.head.appendChild(
            style
        );
    }

    function ensureMounted() {
        installStyle();

        const panel =
            document.getElementById(
                PANEL_ID
            );

        /*
         * V5 typing fix:
         * Lifecycle/focus/click checks must NOT rebuild panel.innerHTML when the
         * helper already exists. V4 did that after clicks, which replaced the
         * textarea/manual/search inputs ~80ms after focus and made them feel
         * impossible to type into. Existing panel is only RE-HOMED here.
         */
        if (panel) {
            placePanel(
                panel
            );
            return true;
        }

        return renderPanel();
    }

    function scheduleMount() {
        clearTimeout(
            state.renderTimer
        );

        state.renderTimer =
            setTimeout(
                ensureMounted,
                80
            );
    }

    function installLifecycleHooks() {
        if (state.unbinders.length) return;

        const onActivity = event => {
            const panel =
                document.getElementById(
                    PANEL_ID
                );

            if (
                event?.target &&
                panel?.contains?.(
                    event.target
                )
            ) {
                return;
            }

            scheduleMount();
        };

        document.addEventListener(
            "click",
            onActivity,
            true
        );

        window.addEventListener(
            "focus",
            onActivity
        );

        window.addEventListener(
            "resize",
            onActivity
        );

        document.addEventListener(
            "visibilitychange",
            onActivity
        );

        state.unbinders.push(
            () => document.removeEventListener("click", onActivity, true),
            () => window.removeEventListener("focus", onActivity),
            () => window.removeEventListener("resize", onActivity),
            () => document.removeEventListener("visibilitychange", onActivity)
        );
    }

    function installObserver() {
        if (
            state.observer ||
            !document.body
        ) {
            return;
        }

        state.observer =
            new MutationObserver(
                () => {
                    const form =
                        getTruckDriverHolder();

                    const panel =
                        document.getElementById(
                            PANEL_ID
                        );

                    if (!panel) {
                        scheduleMount();
                        return;
                    }

                    /*
                     * Re-home an already-visible floating helper as soon as the
                     * real Truck & Driver form becomes visible again.
                     */
                    const preferred = preferredMountTarget();
                    const wantsInline = preferred.mode === "inline";
                    const isFloating = panel.dataset.mountMode === "floating";

                    if (
                        preferred.mode !== panel.dataset.mountMode ||
                        (form && !panel.isConnected)
                    ) {
                        placePanel(
                            panel
                        );
                    }
                }
            );

        state.observer.observe(
            document.body,
            {
                childList:
                    true,
                subtree:
                    true
            }
        );
    }

    function cleanup() {
        clearTimeout(
            state.renderTimer
        );

        clearFillEnforcement();
        cancelAddContainerPreserve();
        cancelManifestOpenWait();

        try {
            state.observer
                ?.disconnect();
        } catch (_) {}

        state.observer =
            null;

        state.unbinders.splice(0).forEach(unbind => {
            try { unbind(); } catch (_) {}
        });

        document
            .getElementById(
                PANEL_ID
            )
            ?.remove();

        document
            .getElementById(
                STYLE_ID
            )
            ?.remove();

        delete window[
            GUARD
        ];
    }

    window[
        GUARD
    ] = {
        cleanup,
        renderNow:
            ensureMounted,
        getEntries:
            () => state.entries.map(entry => ({ ...entry })),
        addOrUpdate:
            (rego, name, current = true) => {
                const result = mergeEntries([{ rego, name, current }], { source: "api" });
                renderPanel();
                return result;
            },
        removeByName:
            name => {
                const removed = removeEntryByName(name);
                renderPanel();
                return removed;
            }
    };

    if (state.entries.length) {
        savePersistentData();
    }

    installStyle();
    ensureMounted();
    installObserver();
    installAddContainerProtection();
    installLifecycleHooks();

    [
        200,
        700,
        1500,
        3200
    ].forEach(
        delay =>
            setTimeout(
                ensureMounted,
                delay
            )
    );

    console.info(
        `[${NAME}] Active.`
    );
})();

//# sourceURL=Jamie_Standalone_OneStop_Driver_Rego_Helper_V9_Second_Fill_Transaction_Race_Fix.js

//# sourceURL=Jamie_OneStop_Driver_Rego_Helper_V15_Minimize_Button.js

//# sourceURL=Jamie_OneStop_Driver_Rego_Helper_V15_Minimize_Button.js
