
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/category" | "/departments" | "/inout" | "/inout/[[date]]" | "/items" | "/login" | "/logs" | "/logs/[[date]]" | "/stocktake" | "/stocktake/history" | "/users";
		RouteParams(): {
			"/inout/[[date]]": { date?: string };
			"/logs/[[date]]": { date?: string }
		};
		LayoutParams(): {
			"/": { date?: string };
			"/category": Record<string, never>;
			"/departments": Record<string, never>;
			"/inout": { date?: string };
			"/inout/[[date]]": { date?: string };
			"/items": Record<string, never>;
			"/login": Record<string, never>;
			"/logs": { date?: string };
			"/logs/[[date]]": { date?: string };
			"/stocktake": Record<string, never>;
			"/stocktake/history": Record<string, never>;
			"/users": Record<string, never>
		};
		Pathname(): "/" | "/category" | "/category/" | "/departments" | "/departments/" | "/inout" | "/inout/" | `/inout${string}` & {} | `/inout${string}/` & {} | "/items" | "/items/" | "/login" | "/login/" | "/logs" | "/logs/" | `/logs${string}` & {} | `/logs${string}/` & {} | "/stocktake" | "/stocktake/" | "/stocktake/history" | "/stocktake/history/" | "/users" | "/users/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | string & {};
	}
}