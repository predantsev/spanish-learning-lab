// Minimal CLI parser: `--name value`, `--name=value`, repeated flags, boolean switches.

export interface ParsedArgs {
  readonly positionals: string[];
  readonly values: Map<string, string[]>;
  readonly switches: Set<string>;
}

export function parseArgs(argv: readonly string[], booleanFlags: readonly string[] = []): ParsedArgs {
  const positionals: string[] = [];
  const values = new Map<string, string[]>();
  const switches = new Set<string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? '';
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    const name = eq >= 0 ? arg.slice(2, eq) : arg.slice(2);
    if (booleanFlags.includes(name)) {
      switches.add(name);
      continue;
    }
    let value: string | undefined;
    if (eq >= 0) value = arg.slice(eq + 1);
    else {
      value = argv[i + 1];
      i++;
    }
    if (value === undefined) throw new Error(`--${name} needs a value`);
    const list = values.get(name) ?? [];
    list.push(value);
    values.set(name, list);
  }
  return { positionals, values, switches };
}

export function one(args: ParsedArgs, name: string): string | undefined {
  const list = args.values.get(name);
  return list?.[list.length - 1];
}

/** All values of a repeated flag, also splitting comma lists. */
export function many(args: ParsedArgs, name: string): string[] {
  return (args.values.get(name) ?? []).flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
}
