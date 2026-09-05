/*
 * ============================================================================
 * JAMIE — STANDALONE DPW SRO YARD MAP V31 — FRT 57 67 LANE CLIPPING FIX
 * ============================================================================
 *
 * PAGE:
 *   https://confr.vbs.1-stop.biz/StackRunReq.aspx
 *
 * DESIGN GOAL:
 * - Copy the INTERACTION PATTERN of the Transfocus Yard Map:
 *
 *      toolbar
 *      block tabs
 *      large visual yard stage
 *      click block
 *      click physical stack
 *      stack opens in a focused popup
 *      see containers vertically by tier
 *
 * - NO "column dashboard" / no long card list.
 *
 * DPW YARD LOCATION:
 *   FRT-32-41-04-2
 *
 * INTERPRETED AS:
 *   Yard Block : FRT-32
 *   Stack      : 41-04
 *   Tier       : 2
 *
 * ACCESS / STACK LOGIC:
 *   TIER 4  = top vertical tier only (NOT proof the container is accessible)
 *   TOP SRO = highest container visible in this SRO at that position
 *   RED     = held / operational issue
 *   DOTTED  = no SRO data at that tier; may be empty or outside this SRO
 *   ? BELOW = a higher container exists but this SRO does not show the support below
 *
 * IMPORTANT:
 * DPW only gives this script the containers visible in the current SRO.
 * A different/non-SRO container could still physically sit above a green box.
 *
 * NO recurring polling / setInterval.
 */

(function () {
    "use strict";

    const NAME =
        "Jamie Standalone DPW SRO Yard Map V31 — FRT 57 67 Lane Clipping Fix";

    const GUARD =
        "__JAMIE_STANDALONE_DPW_SRO_YARD_MAP_V35__";

    const PANEL_ID =
        "jamie-dpw-sro-transfocus-yard-map-v35";

    const STYLE_ID =
        "jamie-dpw-sro-transfocus-yard-map-v35-style";

    const HOLDER_ID =
        "SROContainerListHolder";

    const ROW_FOCUS_ATTR =
        "data-jamie-sro-yard-focus-v35";

    const host =
        String(
            location.hostname || ""
        ).toLowerCase();

    const path =
        String(
            location.pathname || ""
        ).toLowerCase();

    if (
        host !== "confr.vbs.1-stop.biz" ||
        !path.endsWith(
            "/stackrunreq.aspx"
        )
    ) {
        console.info(
            `[${NAME}] Not DPW StackRunReq.aspx — stopped.`
        );

        return;
    }

    /* REMOTE_SOURCE_PLACEHOLDER */
})();
