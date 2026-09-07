/**
 * ATRIA — GERADO. NÃO EDITE À MÃO.
 *
 * Fonte: `services/agents/openapi.json` do repositório `v2/dev`.
 * Regerar: `pnpm atria:types` (ver scripts/generate-api-types.mjs).
 *
 * Rotas geradas: 5 (de 159 no spec)
 * Rotas do Kanban sem tipo de sucesso neste snapshot: 4
 */

export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Liveness & DB health
         * @description Public health probe. Returns the app name/version plus a database connectivity check (status "degraded" if the DB is unreachable). No authentication.
         */
        get: operations["getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/kanban/boards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Kanban boards
         * @description The tenant's Kanban boards (Atendimento, Consulta) with their steps, ordered.
         */
        get: operations["getV1KanbanBoards"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/kanban/boards/{boardId}/cards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List cards on a board
         * @description Paginated cards for one board. countsByStep always reflects every column, unfiltered by ?stepId, so the header count can't silently go stale when a single column is being viewed.
         */
        get: operations["getV1KanbanBoardsByBoardIdCards"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/kanban/cards/{cardId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get card detail
         * @description A single card with its full transition trail (who moved it, from/to, when, why).
         */
        get: operations["getV1KanbanCardsByCardId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/kanban/cards/{cardId}/move": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Move a card
         * @description Moves a card to a different step. 409 when expectedFromStepId no longer matches (the card moved under the caller — reload and retry, never silently overwrite). 400 when the target step belongs to a different board, or when leaving a terminal step without a reason.
         */
        post: operations["postV1KanbanCardsByCardIdMove"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Liveness report. Always 200 — a DB outage is reported as status "degraded", not as an error status. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Database connectivity check result. */
                        db: {
                            /** @constant */
                            ok: true;
                        } | {
                            error: string;
                            /** @constant */
                            ok: false;
                        };
                        /** @description Application name. */
                        name: string;
                        /** @description "ok", or "degraded" when the database is unreachable. */
                        status: "ok" | "degraded";
                        /** @description Application version. */
                        version: string;
                    };
                };
            };
        };
    };
    getV1KanbanBoards: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description SUPER_ADMIN tenant selector (tenant id as a string). Picks the target tenant for this request; ignored for non-super-admin principals, who are pinned to their own tenant. Not truly required — prefilled and marked required here only so Scalar sends it by default.
                 * @example 1
                 */
                "x-tenant-id": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Unauthorized — missing or invalid credentials. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
        };
    };
    getV1KanbanBoardsByBoardIdCards: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: string;
                stepId?: string;
            };
            header: {
                /**
                 * @description SUPER_ADMIN tenant selector (tenant id as a string). Picks the target tenant for this request; ignored for non-super-admin principals, who are pinned to their own tenant. Not truly required — prefilled and marked required here only so Scalar sends it by default.
                 * @example 1
                 */
                "x-tenant-id": string;
            };
            path: {
                boardId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Bad request — validation failed or the input was malformed. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
            /** @description Unauthorized — missing or invalid credentials. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
        };
    };
    getV1KanbanCardsByCardId: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description SUPER_ADMIN tenant selector (tenant id as a string). Picks the target tenant for this request; ignored for non-super-admin principals, who are pinned to their own tenant. Not truly required — prefilled and marked required here only so Scalar sends it by default.
                 * @example 1
                 */
                "x-tenant-id": string;
            };
            path: {
                cardId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Bad request — validation failed or the input was malformed. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
            /** @description Unauthorized — missing or invalid credentials. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
            /** @description Not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
        };
    };
    postV1KanbanCardsByCardIdMove: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description SUPER_ADMIN tenant selector (tenant id as a string). Picks the target tenant for this request; ignored for non-super-admin principals, who are pinned to their own tenant. Not truly required — prefilled and marked required here only so Scalar sends it by default.
                 * @example 1
                 */
                "x-tenant-id": string;
            };
            path: {
                cardId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Step id the caller believes the card is in right now. A mismatch at write time (someone else — most likely Beatriz — moved it first) returns 409, not a silent overwrite. */
                    expectedFromStepId: string;
                    /** @description Required (400) when the card is leaving a terminal step (completed or cancelled). */
                    reason?: string;
                    /** @description Target step id (BigInt as a string). */
                    toStepId: string;
                };
                "application/x-www-form-urlencoded": {
                    /** @description Step id the caller believes the card is in right now. A mismatch at write time (someone else — most likely Beatriz — moved it first) returns 409, not a silent overwrite. */
                    expectedFromStepId: string;
                    /** @description Required (400) when the card is leaving a terminal step (completed or cancelled). */
                    reason?: string;
                    /** @description Target step id (BigInt as a string). */
                    toStepId: string;
                };
                "multipart/form-data": {
                    /** @description Step id the caller believes the card is in right now. A mismatch at write time (someone else — most likely Beatriz — moved it first) returns 409, not a silent overwrite. */
                    expectedFromStepId: string;
                    /** @description Required (400) when the card is leaving a terminal step (completed or cancelled). */
                    reason?: string;
                    /** @description Target step id (BigInt as a string). */
                    toStepId: string;
                };
            };
        };
        responses: {
            /** @description Bad request — validation failed or the input was malformed. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
            /** @description Unauthorized — missing or invalid credentials. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
            /** @description Not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
            /** @description Conflict — a duplicate or a state conflict. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        error: string;
                    };
                };
            };
        };
    };
}
