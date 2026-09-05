/*
 * EDGE DEVTOOLS SNIPPET
 * Name: Transfocus Job Leg Buttons V7 — Better Arrows — No Notification
 *
 * Automatically opens Job Legs and adds three clearly coloured buttons:
 *
 *   GREEN  — G-IN: Rous Head -> Rous Head
 *   BLUE   — Transfer: Rous Head -> Port Beach
 *   PURPLE — Transfer: Port Beach -> Rous Head
 *
 * Shared values:
 *   Depot: MEDPB
 *   Service Code: I40SL
 *   Leg Status: Verified
 *   Container Status: Booked
 *
 * The job is NOT saved automatically.
 */

(() => {
    "use strict";

    const NAME = "Transfocus Job Leg Buttons V7 — Better Arrows — No Notification";
    const VERSION = "7.0";

    const STATE_KEY = "__JAMIE_JOB_LEG_BUTTONS_V7__";
    const WRAPPER_ID = "jamie-job-leg-buttons-v7";
    const STYLE_ID = "jamie-job-leg-buttons-style-v7";
    const TOAST_ID = "jamie-job-leg-buttons-toast-v7";

    const LOCATIONS = {
        ROUS: {
            id: "fae0fdcc-fe41-4bc4-b51b-47da567d709c",
            text: "MEDLOG Rous Head Depot"
        },
        PORT: {
            id: "141d9d2d-885c-4a1d-ac3f-2a2017987e09",
            text: "MEDLOG Port Beach"
        }
    };

    const ROUTES = {
        gin: {
            buttonText: "ADD G-IN — ROUS HEAD  ➜  ROUS HEAD",
            buttonClass: "jamie-gin",
            typeText: "G-IN",
            typeFallbackId: "GI",
            from: LOCATIONS.ROUS,
            to: LOCATIONS.ROUS,
            successText:
                "G-IN · MEDPB\n" +
                "MEDLOG Rous Head Depot → MEDLOG Rous Head Depot\n" +
                "I40SL · Verified"
        },

        rousToPort: {
            buttonText: "TRANSFER — ROUS HEAD  ➜  PORT BEACH",
            buttonClass: "jamie-rous-port",
            typeText: "E-DEP-TR",
            typeFallbackId: "",
            from: LOCATIONS.ROUS,
            to: LOCATIONS.PORT,
            successText:
                "E-DEP-TR · MEDPB\n" +
                "MEDLOG Rous Head Depot → MEDLOG Port Beach\n" +
                "I40SL · Verified"
        },

        portToRous: {
            buttonText: "TRANSFER — PORT BEACH  ➜  ROUS HEAD",
            buttonClass: "jamie-port-rous",
            typeText: "E-DEP-TR",
            typeFallbackId: "",
            from: LOCATIONS.PORT,
            to: LOCATIONS.ROUS,
            successText:
                "E-DEP-TR · MEDPB\n" +
                "MEDLOG Port Beach → MEDLOG Rous Head Depot\n" +
                "I40SL · Verified"
        }
    };

    if (!location.hostname.endsWith("tmspanel.com.au")) {
        console.info(`[${NAME}] Not running because this is not Transfocus.`);
        return;
    }

    const previousState = window[STATE_KEY];

    if (previousState?.observer) {
        try {
            previousState.observer.disconnect();
        } catch (_) {}
    }

    document.getElementById(WRAPPER_ID)?.remove();
    document.getElementById(TOAST_ID)?.remove();

    window[STATE_KEY] = {
        version: VERSION,
        busy: false,
        observer: null,
        dropdowns: {}
    };

    const state = window[STATE_KEY];

    const sleep = milliseconds =>
        new Promise(resolve => window.setTimeout(resolve, milliseconds));

    function normalise(value) {
        return String(value || "")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            #${WRAPPER_ID} {
                display: grid !important;
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                gap: 9px !important;
                box-sizing: border-box !important;
                width: 100% !important;
                padding: 14px 4px 4px !important;
                clear: both !important;
            }

            #${WRAPPER_ID} button {
                display: block !important;
                box-sizing: border-box !important;
                width: 100% !important;
                min-height: 48px !important;
                padding: 10px 12px !important;
                border: 2px solid transparent !important;
                border-radius: 7px !important;
                color: #ffffff !important;
                font-family: Arial, sans-serif !important;
                font-size: 12px !important;
                font-weight: 900 !important;
                line-height: 1.25 !important;
                text-align: center !important;
                cursor: pointer !important;
                box-shadow: 0 3px 10px rgba(0,0,0,.20) !important;
            }

            #${WRAPPER_ID} button.jamie-gin {
                background: #16a34a !important;
                border-color: #166534 !important;
            }

            #${WRAPPER_ID} button.jamie-gin:hover {
                background: #15803d !important;
            }

            #${WRAPPER_ID} button.jamie-rous-port {
                background: #2563eb !important;
                border-color: #1e40af !important;
            }

            #${WRAPPER_ID} button.jamie-rous-port:hover {
                background: #1d4ed8 !important;
            }

            #${WRAPPER_ID} button.jamie-port-rous {
                background: #7c3aed !important;
                border-color: #5b21b6 !important;
            }

            #${WRAPPER_ID} button.jamie-port-rous:hover {
                background: #6d28d9 !important;
            }

            #${WRAPPER_ID} button:disabled {
                background: #64748b !important;
                border-color: #475569 !important;
                cursor: wait !important;
                opacity: 1 !important;
            }

            #${TOAST_ID} {
                position: fixed !important;
                right: 16px !important;
                bottom: 16px !important;
                z-index: 2147483647 !important;
                max-width: 480px !important;
                padding: 11px 14px !important;
                border: 2px solid #1d4ed8 !important;
                border-radius: 7px !important;
                background: #eff6ff !important;
                color: #1e3a8a !important;
                font-family: Arial, sans-serif !important;
                font-size: 13px !important;
                font-weight: 800 !important;
                line-height: 1.4 !important;
                white-space: pre-line !important;
                box-shadow: 0 5px 18px rgba(0,0,0,.28) !important;
            }

            #${TOAST_ID}[data-state="success"] {
                border-color: #15803d !important;
                background: #ecfdf3 !important;
                color: #14532d !important;
            }

            #${TOAST_ID}[data-state="error"] {
                border-color: #b91c1c !important;
                background: #fef2f2 !important;
                color: #7f1d1d !important;
            }

            #jamie-add-gate-in-leg-button,
            #jamie-bottom-gate-in-wrapper-v3,
            #jamie-fast-gin-wrapper-v4,
            #jamie-fast-gin-wrapper-v5,
            #jamie-fast-gin-wrapper-v6 {
                display: none !important;
            }

            @media (max-width: 1150px) {
                #${WRAPPER_ID} {
                    grid-template-columns: 1fr !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function showToast(message, toastState = "working") {
        const method =
            toastState === "error"
                ? "error"
                : toastState === "success"
                    ? "info"
                    : "log";

        console[method](
            `[${NAME}] ${String(message || "").split("\n").join(" | ")}`
        );
    }

    async function ensureJobLegsOpen() {
        const link = document.getElementById("job-legs-panel-link");
        const panel = document.getElementById("job-legs-panel");

        if (!link || !panel) {
            return false;
        }

        const isOpen =
            panel.classList.contains("active") &&
            (
                panel.classList.contains("in") ||
                panel.offsetParent !== null
            );

        if (isOpen) {
            return true;
        }

        const $ = window.jQuery;

        if ($ && typeof $.fn?.tab === "function") {
            $(link).tab("show");
        } else {
            link.click();
        }

        const startedAt = performance.now();

        while (performance.now() - startedAt < 1200) {
            const opened =
                panel.classList.contains("active") &&
                (
                    panel.classList.contains("in") ||
                    panel.offsetParent !== null
                );

            if (opened) {
                return true;
            }

            await sleep(25);
        }

        return false;
    }

    function findBookingInitObjectText() {
        const scriptElement = Array.from(document.scripts).find(element =>
            String(element.textContent || "").includes("Booking.Init(")
        );

        if (!scriptElement) {
            return "";
        }

        const source = String(scriptElement.textContent || "");
        const markerIndex = source.indexOf("Booking.Init(");
        const objectStart = source.indexOf("{", markerIndex);

        if (objectStart < 0) {
            return "";
        }

        let depth = 0;
        let insideString = false;
        let escaped = false;

        for (let index = objectStart; index < source.length; index += 1) {
            const character = source[index];

            if (insideString) {
                if (escaped) {
                    escaped = false;
                    continue;
                }

                if (character === "\\") {
                    escaped = true;
                    continue;
                }

                if (character === '"') {
                    insideString = false;
                }

                continue;
            }

            if (character === '"') {
                insideString = true;
                continue;
            }

            if (character === "{") {
                depth += 1;
                continue;
            }

            if (character === "}") {
                depth -= 1;

                if (depth === 0) {
                    return source.slice(objectStart, index + 1);
                }
            }
        }

        return "";
    }

    function readDropdownData() {
        try {
            const objectText = findBookingInitObjectText();

            if (!objectText) {
                return {};
            }

            const bookingData = JSON.parse(objectText);

            return bookingData?.Dropdowns?.JobLegDropdowns || {};
        } catch (error) {
            console.warn(`[${NAME}] Could not read dropdown data:`, error);
            return {};
        }
    }

    function itemId(item) {
        return String(
            item?.id ??
            item?.ID ??
            item?.value ??
            item?.Value ??
            item?.Code ??
            ""
        );
    }

    function itemText(item) {
        return String(
            item?.text ??
            item?.Text ??
            item?.Name ??
            item?.Description ??
            item?.Code ??
            ""
        );
    }

    function findListOption(listName, wantedText) {
        const list = state.dropdowns?.[listName];

        if (!Array.isArray(list)) {
            return null;
        }

        const wanted = normalise(wantedText);

        const exact = list.find(item =>
            normalise(itemText(item)) === wanted
        );

        if (exact) {
            return {
                id: itemId(exact),
                text: wantedText
            };
        }

        const partial = list.find(item =>
            normalise(itemText(item)).includes(wanted)
        );

        if (!partial) {
            return null;
        }

        return {
            id: itemId(partial),
            text: wantedText
        };
    }

    function findExistingRowOption(dataId, wantedText) {
        const wanted = normalise(wantedText);

        for (const row of document.querySelectorAll("#job-legs tr.job-leg-row")) {
            const input = row.querySelector(`input[data-id="${dataId}"]`);

            if (!input) {
                continue;
            }

            const visible = normalise(
                input.closest("td")?.querySelector(".select2-chosen")?.textContent ||
                input.getAttribute("data-text") ||
                ""
            );

            if (visible !== wanted) {
                continue;
            }

            const id = String(
                input.getAttribute("data-value") ||
                input.value ||
                ""
            );

            if (id) {
                return {
                    id,
                    text: wantedText
                };
            }
        }

        return null;
    }

    function resolveOption({
        dataId,
        listName,
        text,
        fallbackId = ""
    }) {
        return (
            findListOption(listName, text) ||
            findExistingRowOption(dataId, text) ||
            (
                fallbackId
                    ? {
                        id: fallbackId,
                        text
                    }
                    : null
            )
        );
    }

    function buildFieldDefinitions(route) {
        const type = resolveOption({
            dataId: "JobLegTypeID",
            listName: "JobLegTypes",
            text: route.typeText,
            fallbackId: route.typeFallbackId
        });

        const depot = resolveOption({
            dataId: "DepotID",
            listName: "DepotCodes",
            text: "MEDPB",
            fallbackId: LOCATIONS.PORT.id
        });

        const service = resolveOption({
            dataId: "ServiceCodeID",
            listName: "ServiceCodes",
            text: "I40SL",
            fallbackId: "d2c01605-8073-487d-9eef-27683f70b6be"
        });

        const status = resolveOption({
            dataId: "JobLegStatusID",
            listName: "JobLegStatuses",
            text: "Verified",
            fallbackId: "VERIF"
        });

        if (!type) {
            throw new Error(
                `${route.typeText} could not be found. Keep one existing ${route.typeText} row visible and try again.`
            );
        }

        return [
            {
                cell: "Type",
                dataId: "JobLegTypeID",
                listName: "JobLegTypes",
                ...type
            },
            {
                cell: "Depot",
                dataId: "DepotID",
                listName: "DepotCodes",
                ...depot
            },
            {
                cell: "From",
                dataId: "SenderID",
                listName: "Locations",
                ...route.from
            },
            {
                cell: "To",
                dataId: "RecepientID",
                listName: "Locations",
                ...route.to
            },
            {
                cell: "Service Code",
                dataId: "ServiceCodeID",
                listName: "ServiceCodes",
                ...service
            },
            {
                cell: "Leg Status",
                dataId: "JobLegStatusID",
                listName: "JobLegStatuses",
                ...status
            }
        ];
    }

    function getRows() {
        return Array.from(
            document.querySelectorAll("#job-legs tr.job-leg-row")
        );
    }

    async function waitForNewRow(previousRows, timeout = 3500) {
        const startedAt = performance.now();

        while (performance.now() - startedAt < timeout) {
            const row = getRows().find(item => !previousRows.has(item));

            if (row) {
                return row;
            }

            await sleep(20);
        }

        return null;
    }

    function getInput(row, field) {
        return row.querySelector(
            `td[data-leg="${field.cell}"] input[data-id="${field.dataId}"]`
        );
    }

    function removeOldSelect2Container(input) {
        const cell = input.closest("td");

        if (!cell) {
            return;
        }

        Array.from(cell.children).forEach(child => {
            if (
                child !== input &&
                child.classList?.contains("select2-container")
            ) {
                child.remove();
            }
        });
    }

    function listForField(field) {
        if (field.listName === "Locations") {
            return [
                {
                    id: field.id,
                    text: field.text
                }
            ];
        }

        const original = state.dropdowns?.[field.listName];

        if (Array.isArray(original) && original.length) {
            return original.map(item => ({
                id: itemId(item),
                text: itemText(item)
            }));
        }

        return [
            {
                id: field.id,
                text: field.text
            }
        ];
    }

    function initialiseField(row, field) {
        const $ = window.jQuery;

        if (!$ || typeof $.fn?.select2 !== "function") {
            throw new Error("Transfocus Select2 is unavailable");
        }

        const input = getInput(row, field);

        if (!input) {
            throw new Error(`${field.cell} field was not found`);
        }

        const $input = $(input);

        if (input.classList.contains("select2-offscreen")) {
            try {
                $input.select2("destroy");
            } catch (_) {}
        }

        removeOldSelect2Container(input);

        input.classList.remove(
            "lazy-table-select2",
            "lazy-jobleg-select2"
        );

        $input.select2({
            data: listForField(field),
            width: "resolve",
            allowClear: false,
            placeholder: "Select a value"
        });

        return input;
    }

    function selectField(row, field, triggerChange = false) {
        const $ = window.jQuery;
        let input = getInput(row, field);

        if (!input) {
            throw new Error(`${field.cell} field was not found`);
        }

        if (
            !input.classList.contains("select2-offscreen") ||
            !input.closest("td")?.querySelector(".select2-container")
        ) {
            input = initialiseField(row, field);
        }

        const $input = $(input);
        const selected = {
            id: field.id,
            text: field.text
        };

        try {
            $input.select2("data", selected);
        } catch (_) {
            input = initialiseField(row, field);
            $(input).select2("data", selected);
        }

        $input.val(field.id);

        input.value = field.id;
        input.setAttribute("value", field.id);
        input.setAttribute("data-value", field.id);
        input.setAttribute("data-text", field.text);

        $input.attr("data-value", field.id);
        $input.attr("data-text", field.text);
        $input.data("value", field.id);
        $input.data("text", field.text);

        const chosen = input
            .closest("td")
            ?.querySelector(".select2-chosen");

        if (chosen) {
            chosen.textContent = field.text;
        }

        if (triggerChange) {
            $input.trigger("change");
        }
    }

    function setBookedContainerStatus(row) {
        const button = row.querySelector(
            'td[data-leg="Container Status"] button'
        );

        if (!button) {
            return;
        }

        button.value = "BOOKD";
        button.textContent = "Booked";

        button.classList.remove(
            "border-button-blue",
            "bg-green-jungle",
            "bg-red-imp"
        );

        button.classList.add("bg-yellow-crusta");
    }

    function verifyRow(row, fields) {
        return fields.filter(field => {
            const input = getInput(row, field);

            if (!input) {
                return true;
            }

            const visibleText = normalise(
                input.closest("td")?.querySelector(".select2-chosen")?.textContent ||
                input.getAttribute("data-text") ||
                ""
            );

            const actualValue = String(
                input.getAttribute("data-value") ||
                input.value ||
                ""
            );

            return (
                actualValue !== field.id ||
                visibleText !== normalise(field.text)
            );
        });
    }

    function disableAllButtons(disabled, activeRoute = null) {
        document
            .querySelectorAll(`#${WRAPPER_ID} button`)
            .forEach(button => {
                button.disabled = disabled;

                if (disabled && button.dataset.route === activeRoute) {
                    button.textContent = "ADDING LEG…";
                } else if (!disabled) {
                    const route = ROUTES[button.dataset.route];

                    if (route) {
                        button.textContent = route.buttonText;
                    }
                }
            });
    }

    async function createLeg(routeKey) {
        if (state.busy) {
            return;
        }

        const route = ROUTES[routeKey];

        if (!route) {
            return;
        }

        state.busy = true;
        disableAllButtons(true, routeKey);

        try {
            await ensureJobLegsOpen();

            const nativeAddButton = document.getElementById("btn-leg-add");
            const jobLegBody = document.getElementById("job-legs");

            if (!nativeAddButton || !jobLegBody) {
                throw new Error("Open the Job Legs section first");
            }

            const fields = buildFieldDefinitions(route);

            showToast(`Creating ${route.buttonText}…`);

            const previousRows = new Set(getRows());

            nativeAddButton.click();

            const newRow = await waitForNewRow(previousRows);

            if (!newRow) {
                throw new Error("Transfocus did not create a new Job Leg row");
            }

            for (const field of fields) {
                initialiseField(newRow, field);
            }

            selectField(newRow, fields[0], true);

            await sleep(60);

            for (const field of fields.slice(1)) {
                selectField(newRow, field, true);
            }

            setBookedContainerStatus(newRow);

            await sleep(100);

            for (const field of fields) {
                selectField(newRow, field, false);
            }

            setBookedContainerStatus(newRow);

            const failures = verifyRow(newRow, fields);

            if (failures.length) {
                throw new Error(
                    `Could not set: ${failures
                        .map(field => field.cell)
                        .join(", ")}`
                );
            }

            newRow.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "start"
            });

            showToast(
                `${route.successText}\n\n` +
                "Check the date, then press the normal Save button.",
                "success",
                8000
            );
        } catch (error) {
            console.error(`[${NAME}]`, error);

            showToast(
                `JOB LEG FAILED\n${error?.message || String(error)}`,
                "error",
                10000
            );
        } finally {
            state.busy = false;
            disableAllButtons(false);
        }
    }

    function installButtons() {
        injectStyles();

        const jobLegContainer = document.getElementById("jobVerifyList");

        if (!jobLegContainer) {
            return false;
        }

        if (document.getElementById(WRAPPER_ID)) {
            return true;
        }

        const wrapper = document.createElement("div");
        wrapper.id = WRAPPER_ID;

        for (const [routeKey, route] of Object.entries(ROUTES)) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = route.buttonClass;
            button.dataset.route = routeKey;
            button.textContent = route.buttonText;

            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                createLeg(routeKey);
            });

            wrapper.appendChild(button);
        }

        jobLegContainer.insertAdjacentElement("afterend", wrapper);

        return true;
    }

    async function start() {
        state.dropdowns = readDropdownData();

        await ensureJobLegsOpen();
        installButtons();

        const observer = new MutationObserver(installButtons);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        state.observer = observer;

        console.info(
            `[${NAME}] v${VERSION} active.`,
            Object.keys(state.dropdowns || {})
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );
    } else {
        start();
    }
})();

//# sourceURL=Jamie_Transfocus_Job_Leg_Buttons_V7_Better_Arrows_No_Notification.js
