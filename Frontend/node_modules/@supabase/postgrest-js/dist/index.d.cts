//#region src/PostgrestError.d.ts
/**
 * Error format
 *
 * {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
 */
declare class PostgrestError extends Error {
  details: string;
  hint: string;
  code: string;
  /**
   * @example
   * ```ts
   * import PostgrestError from '@supabase/postgrest-js'
   *
   * throw new PostgrestError({
   *   message: 'Row level security prevented the request',
   *   details: 'RLS denied the insert',
   *   hint: 'Check your policies',
   *   code: 'PGRST301',
   * })
   * ```
   */
  constructor(context: {
    message: string;
    details: string;
    hint: string;
    code: string;
  });
}
//#endregion
//#region src/types/common/common.d.ts
type Fetch = typeof fetch;
type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
};
type GenericUpdatableView = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
};
type GenericNonUpdatableView = {
  Row: Record<string, unknown>;
  Relationships: GenericRelationship[];
};
type GenericView = GenericUpdatableView | GenericNonUpdatableView;
type GenericSetofOption = {
  isSetofReturn?: boolean | undefined;
  isOneToOne?: boolean | undefined;
  isNotNullable?: boolean | undefined;
  to: string;
  from: string;
};
type GenericFunction = {
  Args: Record<string, unknown> | never;
  Returns: unknown;
  SetofOptions?: GenericSetofOption;
};
type GenericSchema = {
  Tables: Record<string, GenericTable>;
  Views: Record<string, GenericView>;
  Functions: Record<string, GenericFunction>;
};
type ClientServerOptions = {
  PostgrestVersion?: string;
};
//#endregion
//#region src/select-query-parser/types.d.ts
type AggregateWithoutColumnFunctions = 'count';
type AggregateWithColumnFunctions = 'sum' | 'avg' | 'min' | 'max' | AggregateWithoutColumnFunctions;
type AggregateFunctions = AggregateWithColumnFunctions;
type Json = string | number | boolean | null | {
  [key: string]: Json | undefined;
} | Json[];
type PostgresSQLNumberTypes = 'int2' | 'int4' | 'int8' | 'float4' | 'float8' | 'numeric';
type PostgresSQLStringTypes = 'bytea' | 'bpchar' | 'varchar' | 'date' | 'text' | 'citext' | 'time' | 'timetz' | 'timestamp' | 'timestamptz' | 'uuid' | 'vector';
type SingleValuePostgreSQLTypes = PostgresSQLNumberTypes | PostgresSQLStringTypes | 'bool' | 'json' | 'jsonb' | 'void' | 'record' | string;
type ArrayPostgreSQLTypes = `_${SingleValuePostgreSQLTypes}`;
type TypeScriptSingleValueTypes<T extends SingleValuePostgreSQLTypes> = T extends 'bool' ? boolean : T extends PostgresSQLNumberTypes ? number : T extends PostgresSQLStringTypes ? string : T extends 'json' | 'jsonb' ? Json : T extends 'void' ? undefined : T extends 'record' ? Record<string, unknown> : unknown;
type StripUnderscore<T extends string> = T extends `_${infer U}` ? U : T;
type PostgreSQLTypes = SingleValuePostgreSQLTypes | ArrayPostgreSQLTypes;
type TypeScriptTypes<T extends PostgreSQLTypes> = T extends ArrayPostgreSQLTypes ? TypeScriptSingleValueTypes<StripUnderscore<Extract<T, SingleValuePostgreSQLTypes>>>[] : TypeScriptSingleValueTypes<T>;
type UnionToIntersection$1<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type LastOf$1<T> = UnionToIntersection$1<T extends any ? () => T : never> extends (() => infer R) ? R : never;
type Push<T extends any[], V> = [...T, V];
type UnionToTuple<T, L$1 = LastOf$1<T>, N = ([T] extends [never] ? true : false)> = N extends true ? [] : Push<UnionToTuple<Exclude<T, L$1>>, L$1>;
type UnionToArray<T> = UnionToTuple<T>;
type ExtractFirstProperty<T> = T extends { [K in keyof T]: infer U } ? U : never;
type ContainsNull<T> = null extends T ? true : false;
type IsNonEmptyArray<T> = Exclude<T, undefined> extends readonly [unknown, ...unknown[]] ? true : false;
type TablesAndViews$2<Schema extends GenericSchema> = Schema['Tables'] & Exclude<Schema['Views'], ''>;
//#endregion
//#region src/select-query-parser/parser.d.ts
/**
 * Parses a query.
 * A query is a sequence of nodes, separated by `,`, ensuring that there is
 * no remaining input after all nodes have been parsed.
 *
 * Returns an array of parsed nodes, or an error.
 */
type ParseQuery<Query extends string> = string extends Query ? GenericStringError : ParseNodes<EatWhitespace<Query>> extends [infer Nodes, `${infer Remainder}`] ? Nodes extends Ast.Node[] ? EatWhitespace<Remainder> extends '' ? SimplifyDeep<Nodes> : ParserError<`Unexpected input: ${Remainder}`> : ParserError<'Invalid nodes array structure'> : ParseNodes<EatWhitespace<Query>>;
/**
 * Notes: all `Parse*` types assume that their input strings have their whitespace
 * removed. They return tuples of ["Return Value", "Remainder of text"] or
 * a `ParserError`.
 */
/**
 * Parses a sequence of nodes, separated by `,`.
 *
 * Returns a tuple of ["Parsed fields", "Remainder of text"] or an error.
 */
type ParseNodes<Input extends string> = string extends Input ? GenericStringError : ParseNodesHelper<Input, []>;
type ParseNodesHelper<Input extends string, Nodes$1 extends Ast.Node[]> = ParseNode<Input> extends [infer Node, `${infer Remainder}`] ? Node extends Ast.Node ? EatWhitespace<Remainder> extends `,${infer Remainder}` ? ParseNodesHelper<EatWhitespace<Remainder>, [...Nodes$1, Node]> : [[...Nodes$1, Node], EatWhitespace<Remainder>] : ParserError<'Invalid node type in nodes helper'> : ParseNode<Input>;
/**
 * Parses a node.
 * A node is one of the following:
 * - `*`
 * - a field, as defined above
 * - a renamed field, `renamed_field:field`
 * - a spread field, `...field`
 */
type ParseNode<Input extends string> = Input extends '' ? ParserError<'Empty string'> : Input extends `*${infer Remainder}` ? [Ast.StarNode, EatWhitespace<Remainder>] : Input extends `...${infer Remainder}` ? ParseField<EatWhitespace<Remainder>> extends [infer TargetField, `${infer Remainder}`] ? TargetField extends Ast.FieldNode ? [{
  type: 'spread';
  target: TargetField;
}, EatWhitespace<Remainder>] : ParserError<'Invalid target field type in spread'> : ParserError<`Unable to parse spread resource at \`${Input}\``> : ParseIdentifier<Input> extends [infer NameOrAlias, `${infer Remainder}`] ? EatWhitespace<Remainder> extends `::${infer _}` ? ParseField<Input> : EatWhitespace<Remainder> extends `:${infer Remainder}` ? ParseField<EatWhitespace<Remainder>> extends [infer Field, `${infer Remainder}`] ? Field extends Ast.FieldNode ? [Omit<Field, 'alias'> & {
  alias: NameOrAlias;
}, EatWhitespace<Remainder>] : ParserError<'Invalid field type in alias parsing'> : ParserError<`Unable to parse renamed field at \`${Input}\``> : ParseField<Input> : ParserError<`Expected identifier at \`${Input}\``>;
/**
 * Parses a field without preceding alias.
 * A field is one of the following:
 * - a top-level `count` field: https://docs.postgrest.org/en/v12/references/api/aggregate_functions.html#the-case-of-count
 * - a field with an embedded resource
 *   - `field(nodes)`
 *   - `field!hint(nodes)`
 *   - `field!inner(nodes)`
 *   - `field!left(nodes)`
 *   - `field!hint!inner(nodes)`
 *   - `field!hint!left(nodes)`
 * - a field without an embedded resource (see {@link ParseNonEmbeddedResourceField})
 */
type ParseField<Input extends string> = Input extends '' ? ParserError<'Empty string'> : ParseIdentifier<Input> extends [infer Name, `${infer Remainder}`] ? Name extends 'count' ? ParseCountField<Input> : Remainder extends `!inner${infer Remainder}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Children, `${infer Remainder}`] ? Children extends Ast.Node[] ? [{
  type: 'field';
  name: Name;
  innerJoin: true;
  children: Children;
}, Remainder] : ParserError<'Invalid children array in inner join'> : CreateParserErrorIfRequired<ParseEmbeddedResource<EatWhitespace<Remainder>>, `Expected embedded resource after "!inner" at \`${Remainder}\``> : EatWhitespace<Remainder> extends `!left${infer Remainder}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Children, `${infer Remainder}`] ? Children extends Ast.Node[] ? [{
  type: 'field';
  name: Name;
  children: Children;
}, EatWhitespace<Remainder>] : ParserError<'Invalid children array in left join'> : CreateParserErrorIfRequired<ParseEmbeddedResource<EatWhitespace<Remainder>>, `Expected embedded resource after "!left" at \`${EatWhitespace<Remainder>}\``> : EatWhitespace<Remainder> extends `!${infer Remainder}` ? ParseIdentifier<EatWhitespace<Remainder>> extends [infer Hint, `${infer Remainder}`] ? EatWhitespace<Remainder> extends `!inner${infer Remainder}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Children, `${infer Remainder}`] ? Children extends Ast.Node[] ? [{
  type: 'field';
  name: Name;
  hint: Hint;
  innerJoin: true;
  children: Children;
}, EatWhitespace<Remainder>] : ParserError<'Invalid children array in hint inner join'> : ParseEmbeddedResource<EatWhitespace<Remainder>> : ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Children, `${infer Remainder}`] ? Children extends Ast.Node[] ? [{
  type: 'field';
  name: Name;
  hint: Hint;
  children: Children;
}, EatWhitespace<Remainder>] : ParserError<'Invalid children array in hint'> : ParseEmbeddedResource<EatWhitespace<Remainder>> : ParserError<`Expected identifier after "!" at \`${EatWhitespace<Remainder>}\``> : EatWhitespace<Remainder> extends `(${infer _}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Children, `${infer Remainder}`] ? Children extends Ast.Node[] ? [{
  type: 'field';
  name: Name;
  children: Children;
}, EatWhitespace<Remainder>] : ParserError<'Invalid children array in field'> : ParseEmbeddedResource<EatWhitespace<Remainder>> : ParseNonEmbeddedResourceField<Input> : ParserError<`Expected identifier at \`${Input}\``>;
type ParseCountField<Input extends string> = ParseIdentifier<Input> extends ['count', `${infer Remainder}`] ? (EatWhitespace<Remainder> extends `()${infer Remainder_}` ? EatWhitespace<Remainder_> : EatWhitespace<Remainder>) extends `${infer Remainder}` ? Remainder extends `::${infer _}` ? ParseFieldTypeCast<Remainder> extends [infer CastType, `${infer Remainder}`] ? [{
  type: 'field';
  name: 'count';
  aggregateFunction: 'count';
  castType: CastType;
}, Remainder] : ParseFieldTypeCast<Remainder> : [{
  type: 'field';
  name: 'count';
  aggregateFunction: 'count';
}, Remainder] : never : ParserError<`Expected "count" at \`${Input}\``>;
/**
 * Parses an embedded resource, which is an opening `(`, followed by a sequence of
 * 0 or more nodes separated by `,`, then a closing `)`.
 *
 * Returns a tuple of ["Parsed fields", "Remainder of text"], an error,
 * or the original string input indicating that no opening `(` was found.
 */
type ParseEmbeddedResource<Input extends string> = Input extends `(${infer Remainder}` ? EatWhitespace<Remainder> extends `)${infer Remainder}` ? [[], EatWhitespace<Remainder>] : ParseNodes<EatWhitespace<Remainder>> extends [infer Nodes, `${infer Remainder}`] ? Nodes extends Ast.Node[] ? EatWhitespace<Remainder> extends `)${infer Remainder}` ? [Nodes, EatWhitespace<Remainder>] : ParserError<`Expected ")" at \`${EatWhitespace<Remainder>}\``> : ParserError<'Invalid nodes array in embedded resource'> : ParseNodes<EatWhitespace<Remainder>> : ParserError<`Expected "(" at \`${Input}\``>;
/**
 * Parses a field excluding embedded resources, without preceding field renaming.
 * This is one of the following:
 * - `field`
 * - `field.aggregate()`
 * - `field.aggregate()::type`
 * - `field::type`
 * - `field::type.aggregate()`
 * - `field::type.aggregate()::type`
 * - `field->json...`
 * - `field->json.aggregate()`
 * - `field->json.aggregate()::type`
 * - `field->json::type`
 * - `field->json::type.aggregate()`
 * - `field->json::type.aggregate()::type`
 */
type ParseNonEmbeddedResourceField<Input extends string> = ParseIdentifier<Input> extends [infer Name, `${infer Remainder}`] ? (Remainder extends `->${infer PathAndRest}` ? ParseJsonAccessor<Remainder> extends [infer PropertyName, infer PropertyType, `${infer Remainder}`] ? [{
  type: 'field';
  name: Name;
  alias: PropertyName;
  castType: PropertyType;
  jsonPath: JsonPathToAccessor<PathAndRest extends `${infer Path},${string}` ? Path : PathAndRest>;
}, Remainder] : ParseJsonAccessor<Remainder> : [{
  type: 'field';
  name: Name;
}, Remainder]) extends infer Parsed ? Parsed extends [infer Field, `${infer Remainder}`] ? (Remainder extends `::${infer _}` ? ParseFieldTypeCast<Remainder> extends [infer CastType, `${infer Remainder}`] ? [Omit<Field, 'castType'> & {
  castType: CastType;
}, Remainder] : ParseFieldTypeCast<Remainder> : [Field, Remainder]) extends infer Parsed ? Parsed extends [infer Field, `${infer Remainder}`] ? Remainder extends `.${infer _}` ? ParseFieldAggregation<Remainder> extends [infer AggregateFunction, `${infer Remainder}`] ? Remainder extends `::${infer _}` ? ParseFieldTypeCast<Remainder> extends [infer CastType, `${infer Remainder}`] ? [Omit<Field, 'castType'> & {
  aggregateFunction: AggregateFunction;
  castType: CastType;
}, Remainder] : ParseFieldTypeCast<Remainder> : [Field & {
  aggregateFunction: AggregateFunction;
}, Remainder] : ParseFieldAggregation<Remainder> : [Field, Remainder] : Parsed : never : Parsed : never : ParserError<`Expected identifier at \`${Input}\``>;
/**
 * Parses a JSON property accessor of the shape `->a->b->c`. The last accessor in
 * the series may convert to text by using the ->> operator instead of ->.
 *
 * Returns a tuple of ["Last property name", "Last property type", "Remainder of text"]
 */
type ParseJsonAccessor<Input extends string> = Input extends `->${infer Remainder}` ? Remainder extends `>${infer Remainder}` ? ParseIdentifier<Remainder> extends [infer Name, `${infer Remainder}`] ? [Name, 'text', EatWhitespace<Remainder>] : ParserError<'Expected property name after `->>`'> : ParseIdentifier<Remainder> extends [infer Name, `${infer Remainder}`] ? ParseJsonAccessor<Remainder> extends [infer PropertyName, infer PropertyType, `${infer Remainder}`] ? [PropertyName, PropertyType, EatWhitespace<Remainder>] : [Name, 'json', EatWhitespace<Remainder>] : ParserError<'Expected property name after `->`'> : ParserError<'Expected ->'>;
/**
 * Parses a field typecast (`::type`), returning a tuple of ["Type", "Remainder of text"].
 */
type ParseFieldTypeCast<Input extends string> = EatWhitespace<Input> extends `::${infer Remainder}` ? ParseIdentifier<EatWhitespace<Remainder>> extends [`${infer CastType}`, `${infer Remainder}`] ? [CastType, EatWhitespace<Remainder>] : ParserError<`Invalid type for \`::\` operator at \`${Remainder}\``> : ParserError<'Expected ::'>;
/**
 * Parses a field aggregation (`.max()`), returning a tuple of ["Aggregate function", "Remainder of text"]
 */
type ParseFieldAggregation<Input extends string> = EatWhitespace<Input> extends `.${infer Remainder}` ? ParseIdentifier<EatWhitespace<Remainder>> extends [`${infer FunctionName}`, `${infer Remainder}`] ? FunctionName extends Token.AggregateFunction ? EatWhitespace<Remainder> extends `()${infer Remainder}` ? [FunctionName, EatWhitespace<Remainder>] : ParserError<`Expected \`()\` after \`.\` operator \`${FunctionName}\``> : ParserError<`Invalid type for \`.\` operator \`${FunctionName}\``> : ParserError<`Invalid type for \`.\` operator at \`${Remainder}\``> : ParserError<'Expected .'>;
/**
 * Parses a (possibly double-quoted) identifier.
 * Identifiers are sequences of 1 or more letters.
 */
type ParseIdentifier<Input extends string> = ParseLetters<Input> extends [infer Name, `${infer Remainder}`] ? [Name, EatWhitespace<Remainder>] : ParseQuotedLetters<Input> extends [infer Name, `${infer Remainder}`] ? [Name, EatWhitespace<Remainder>] : ParserError<`No (possibly double-quoted) identifier at \`${Input}\``>;
/**
 * Parse a consecutive sequence of 1 or more letter, where letters are `[0-9a-zA-Z_]`.
 */
type ParseLetters<Input extends string> = string extends Input ? GenericStringError : ParseLettersHelper<Input, ''> extends [`${infer Letters}`, `${infer Remainder}`] ? Letters extends '' ? ParserError<`Expected letter at \`${Input}\``> : [Letters, Remainder] : ParseLettersHelper<Input, ''>;
type ParseLettersHelper<Input extends string, Acc extends string> = string extends Input ? GenericStringError : Input extends `${infer L}${infer Remainder}` ? L extends Token.Letter ? ParseLettersHelper<Remainder, `${Acc}${L}`> : [Acc, Input] : [Acc, ''];
/**
 * Parse a consecutive sequence of 1 or more double-quoted letters,
 * where letters are `[^"]`.
 */
type ParseQuotedLetters<Input extends string> = string extends Input ? GenericStringError : Input extends `"${infer Remainder}` ? ParseQuotedLettersHelper<Remainder, ''> extends [`${infer Letters}`, `${infer Remainder}`] ? Letters extends '' ? ParserError<`Expected string at \`${Remainder}\``> : [Letters, Remainder] : ParseQuotedLettersHelper<Remainder, ''> : ParserError<`Not a double-quoted string at \`${Input}\``>;
type ParseQuotedLettersHelper<Input extends string, Acc extends string> = string extends Input ? GenericStringError : Input extends `${infer L}${infer Remainder}` ? L extends '"' ? [Acc, Remainder] : ParseQuotedLettersHelper<Remainder, `${Acc}${L}`> : ParserError<`Missing closing double-quote in \`"${Acc}${Input}\``>;
/**
 * Trims whitespace from the left of the input.
 */
type EatWhitespace<Input extends string> = string extends Input ? GenericStringError : Input extends `${Token.Whitespace}${infer Remainder}` ? EatWhitespace<Remainder> : Input;
/**
 * Creates a new {@link ParserError} if the given input is not already a parser error.
 */
type CreateParserErrorIfRequired<Input, Message extends string> = Input extends ParserError<string> ? Input : ParserError<Message>;
/**
 * Parser errors.
 */
type ParserError<Message extends string> = {
  error: true;
} & Message;
type GenericStringError = ParserError<'Received a generic string'>;
declare namespace Ast {
  type Node = FieldNode | StarNode | SpreadNode;
  type FieldNode = {
    type: 'field';
    name: string;
    alias?: string;
    hint?: string;
    innerJoin?: true;
    castType?: string;
    jsonPath?: string;
    aggregateFunction?: Token.AggregateFunction;
    children?: Node[];
  };
  type StarNode = {
    type: 'star';
  };
  type SpreadNode = {
    type: 'spread';
    target: FieldNode & {
      children: Node[];
    };
  };
}
declare namespace Token {
  export type Whitespace = ' ' | '\n' | '\t';
  type LowerAlphabet = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
  type Alphabet = LowerAlphabet | Uppercase<LowerAlphabet>;
  type Digit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
  export type Letter = Alphabet | Digit | '_';
  export type AggregateFunction = 'count' | 'sum' | 'avg' | 'min' | 'max';
  export {};
}
//#endregion
//#region src/select-query-parser/utils.d.ts
type IsAny$1<T> = 0 extends 1 & T ? true : false;
type SelectQueryError<Message extends string> = {
  error: true;
} & Message;
type DeduplicateRelationships<T extends readonly unknown[]> = T extends readonly [infer First, ...infer Rest] ? First extends Rest[number] ? DeduplicateRelationships<Rest extends readonly unknown[] ? Rest : []> : [First, ...DeduplicateRelationships<Rest extends readonly unknown[] ? Rest : []>] : T;
type GetFieldNodeResultName<Field$1 extends Ast.FieldNode> = Field$1['alias'] extends string ? Field$1['alias'] : Field$1['aggregateFunction'] extends AggregateFunctions ? Field$1['aggregateFunction'] : Field$1['name'];
type FilterRelationNodes<Nodes$1 extends Ast.Node[]> = UnionToArray<{ [K in keyof Nodes$1]: Nodes$1[K] extends Ast.SpreadNode ? Nodes$1[K]['target'] : Nodes$1[K] extends Ast.FieldNode ? IsNonEmptyArray<Nodes$1[K]['children']> extends true ? Nodes$1[K] : never : never }[number]>;
type ResolveRelationships<Schema extends GenericSchema, RelationName extends string, Relationships extends GenericRelationship[], Nodes$1 extends Ast.FieldNode[]> = UnionToArray<{ [K in keyof Nodes$1]: Nodes$1[K] extends Ast.FieldNode ? ResolveRelationship<Schema, Relationships, Nodes$1[K], RelationName> extends infer Relation ? Relation extends {
  relation: {
    referencedRelation: string;
    foreignKeyName: string;
    match: string;
  };
  from: string;
} ? {
  referencedTable: Relation['relation']['referencedRelation'];
  fkName: Relation['relation']['foreignKeyName'];
  from: Relation['from'];
  match: Relation['relation']['match'];
  fieldName: GetFieldNodeResultName<Nodes$1[K]>;
} : Relation : never : never }>[0];
/**
 * Checks if a relation is implicitly referenced twice, requiring disambiguation
 */
type IsDoubleReference<T, U> = T extends {
  referencedTable: infer RT;
  fieldName: infer FN;
  match: infer M;
} ? M extends 'col' | 'refrel' ? U extends {
  referencedTable: RT;
  fieldName: FN;
  match: M;
} ? true : false : false : false;
/**
 * Compares one element with all other elements in the array to find duplicates
 */
type CheckDuplicates<Arr extends any[], Current> = Arr extends [infer Head, ...infer Tail] ? IsDoubleReference<Current, Head> extends true ? Head | CheckDuplicates<Tail, Current> : CheckDuplicates<Tail, Current> : never;
/**
 * Iterates over the elements of the array to find duplicates
 */
type FindDuplicatesWithinDeduplicated<Arr extends any[]> = Arr extends [infer Head, ...infer Tail] ? CheckDuplicates<Tail, Head> | FindDuplicatesWithinDeduplicated<Tail> : never;
type FindDuplicates<Arr extends any[]> = FindDuplicatesWithinDeduplicated<DeduplicateRelationships<Arr>>;
type CheckDuplicateEmbededReference<Schema extends GenericSchema, RelationName extends string, Relationships extends GenericRelationship[], Nodes$1 extends Ast.Node[]> = FilterRelationNodes<Nodes$1> extends infer RelationsNodes ? RelationsNodes extends Ast.FieldNode[] ? ResolveRelationships<Schema, RelationName, Relationships, RelationsNodes> extends infer ResolvedRels ? ResolvedRels extends unknown[] ? FindDuplicates<ResolvedRels> extends infer Duplicates ? Duplicates extends never ? false : Duplicates extends {
  fieldName: infer FieldName;
} ? FieldName extends string ? { [K in FieldName]: SelectQueryError<`table "${RelationName}" specified more than once use hinting for desambiguation`> } : false : false : false : false : false : false : false;
/**
 * Returns a boolean representing whether there is a foreign key referencing
 * a given relation.
 */
type HasFKeyToFRel<FRelName, Relationships> = Relationships extends [infer R] ? R extends {
  referencedRelation: FRelName;
} ? true : false : Relationships extends [infer R, ...infer Rest] ? HasFKeyToFRel<FRelName, [R]> extends true ? true : HasFKeyToFRel<FRelName, Rest> : false;
/**
 * Checks if there is more than one relation to a given foreign relation name in the Relationships.
 */
type HasMultipleFKeysToFRelDeduplicated<FRelName, Relationships> = Relationships extends [infer R, ...infer Rest] ? R extends {
  referencedRelation: FRelName;
} ? HasFKeyToFRel<FRelName, Rest> extends true ? true : HasMultipleFKeysToFRelDeduplicated<FRelName, Rest> : HasMultipleFKeysToFRelDeduplicated<FRelName, Rest> : false;
type HasMultipleFKeysToFRel<FRelName, Relationships extends unknown[]> = HasMultipleFKeysToFRelDeduplicated<FRelName, DeduplicateRelationships<Relationships>>;
type CheckRelationshipError<Schema extends GenericSchema, Relationships extends GenericRelationship[], CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string, FoundRelation$1> = FoundRelation$1 extends SelectQueryError<string> ? FoundRelation$1 : FoundRelation$1 extends {
  relation: {
    referencedRelation: infer RelatedRelationName;
    name: string;
  };
  direction: 'reverse';
} ? RelatedRelationName extends string ? HasMultipleFKeysToFRel<RelatedRelationName, Relationships> extends true ? SelectQueryError<`Could not embed because more than one relationship was found for '${RelatedRelationName}' and '${CurrentTableOrView}' you need to hint the column with ${RelatedRelationName}!<columnName> ?`> : FoundRelation$1 : never : FoundRelation$1 extends {
  relation: {
    referencedRelation: infer RelatedRelationName;
    name: string;
  };
  direction: 'forward';
  from: infer From;
} ? RelatedRelationName extends string ? From extends keyof TablesAndViews$2<Schema> & string ? HasMultipleFKeysToFRel<RelatedRelationName, TablesAndViews$2<Schema>[From]['Relationships']> extends true ? SelectQueryError<`Could not embed because more than one relationship was found for '${From}' and '${RelatedRelationName}' you need to hint the column with ${From}!<columnName> ?`> : FoundRelation$1 : never : never : FoundRelation$1;
/**
 * Resolves relationships for embedded resources and retrieves the referenced Table
 */
type ResolveRelationship<Schema extends GenericSchema, Relationships extends GenericRelationship[], Field$1 extends Ast.FieldNode, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string> = ResolveReverseRelationship<Schema, Relationships, Field$1, CurrentTableOrView> extends infer ReverseRelationship ? ReverseRelationship extends false ? CheckRelationshipError<Schema, Relationships, CurrentTableOrView, ResolveForwardRelationship<Schema, Field$1, CurrentTableOrView>> : CheckRelationshipError<Schema, Relationships, CurrentTableOrView, ReverseRelationship> : never;
/**
 * Resolves reverse relationships (from children to parent)
 */
type ResolveReverseRelationship<Schema extends GenericSchema, Relationships extends GenericRelationship[], Field$1 extends Ast.FieldNode, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string> = FindFieldMatchingRelationships<Schema, Relationships, Field$1> extends infer FoundRelation ? FoundRelation extends never ? false : FoundRelation extends {
  referencedRelation: infer RelatedRelationName;
} ? RelatedRelationName extends string ? RelatedRelationName extends keyof TablesAndViews$2<Schema> ? FoundRelation extends {
  hint: string;
} ? {
  referencedTable: TablesAndViews$2<Schema>[RelatedRelationName];
  relation: FoundRelation;
  direction: 'reverse';
  from: CurrentTableOrView;
} : HasMultipleFKeysToFRel<RelatedRelationName, Relationships> extends true ? SelectQueryError<`Could not embed because more than one relationship was found for '${RelatedRelationName}' and '${CurrentTableOrView}' you need to hint the column with ${RelatedRelationName}!<columnName> ?`> : {
  referencedTable: TablesAndViews$2<Schema>[RelatedRelationName];
  relation: FoundRelation;
  direction: 'reverse';
  from: CurrentTableOrView;
} : SelectQueryError<`Relation '${RelatedRelationName}' not found in schema.`> : false : false : false;
type FindMatchingTableRelationships<Schema extends GenericSchema, Relationships extends GenericRelationship[], value extends string> = Relationships extends [infer R, ...infer Rest] ? Rest extends GenericRelationship[] ? R extends {
  referencedRelation: infer ReferencedRelation;
} ? ReferencedRelation extends keyof Schema['Tables'] ? R extends {
  foreignKeyName: value;
} ? R & {
  match: 'fkname';
} : R extends {
  referencedRelation: value;
} ? R & {
  match: 'refrel';
} : R extends {
  columns: [value];
} ? R & {
  match: 'col';
} : FindMatchingTableRelationships<Schema, Rest, value> : FindMatchingTableRelationships<Schema, Rest, value> : false : false : false;
type FindMatchingViewRelationships<Schema extends GenericSchema, Relationships extends GenericRelationship[], value extends string> = Relationships extends [infer R, ...infer Rest] ? Rest extends GenericRelationship[] ? R extends {
  referencedRelation: infer ReferencedRelation;
} ? ReferencedRelation extends keyof Schema['Views'] ? R extends {
  foreignKeyName: value;
} ? R & {
  match: 'fkname';
} : R extends {
  referencedRelation: value;
} ? R & {
  match: 'refrel';
} : R extends {
  columns: [value];
} ? R & {
  match: 'col';
} : FindMatchingViewRelationships<Schema, Rest, value> : FindMatchingViewRelationships<Schema, Rest, value> : false : false : false;
type FindMatchingHintTableRelationships<Schema extends GenericSchema, Relationships extends GenericRelationship[], hint extends string, name extends string> = Relationships extends [infer R, ...infer Rest] ? Rest extends GenericRelationship[] ? R extends {
  referencedRelation: infer ReferencedRelation;
} ? ReferencedRelation extends name ? R extends {
  foreignKeyName: hint;
} ? R & {
  match: 'fkname';
} : R extends {
  referencedRelation: hint;
} ? R & {
  match: 'refrel';
} : R extends {
  columns: [hint];
} ? R & {
  match: 'col';
} : FindMatchingHintTableRelationships<Schema, Rest, hint, name> : FindMatchingHintTableRelationships<Schema, Rest, hint, name> : false : false : false;
type FindMatchingHintViewRelationships<Schema extends GenericSchema, Relationships extends GenericRelationship[], hint extends string, name extends string> = Relationships extends [infer R, ...infer Rest] ? Rest extends GenericRelationship[] ? R extends {
  referencedRelation: infer ReferencedRelation;
} ? ReferencedRelation extends name ? R extends {
  foreignKeyName: hint;
} ? R & {
  match: 'fkname';
} : R extends {
  referencedRelation: hint;
} ? R & {
  match: 'refrel';
} : R extends {
  columns: [hint];
} ? R & {
  match: 'col';
} : FindMatchingHintViewRelationships<Schema, Rest, hint, name> : FindMatchingHintViewRelationships<Schema, Rest, hint, name> : false : false : false;
type IsColumnsNullable<Table extends Pick<GenericTable, 'Row'>, Columns extends (keyof Table['Row'])[]> = Columns extends [infer Column, ...infer Rest] ? Column extends keyof Table['Row'] ? ContainsNull<Table['Row'][Column]> extends true ? true : IsColumnsNullable<Table, Rest extends (keyof Table['Row'])[] ? Rest : []> : false : false;
type IsRelationNullable<Table extends GenericTable, Relation$1 extends GenericRelationship> = IsColumnsNullable<Table, Relation$1['columns']>;
type TableForwardRelationships<Schema extends GenericSchema, TName> = TName extends keyof TablesAndViews$2<Schema> ? UnionToArray<RecursivelyFindRelationships<Schema, TName, keyof TablesAndViews$2<Schema>>> extends infer R ? R extends (GenericRelationship & {
  from: keyof TablesAndViews$2<Schema>;
})[] ? R : [] : [] : [];
type RecursivelyFindRelationships<Schema extends GenericSchema, TName, Keys extends keyof TablesAndViews$2<Schema>> = Keys extends infer K ? K extends keyof TablesAndViews$2<Schema> ? FilterRelationships<TablesAndViews$2<Schema>[K]['Relationships'], TName, K> extends never ? RecursivelyFindRelationships<Schema, TName, Exclude<Keys, K>> : FilterRelationships<TablesAndViews$2<Schema>[K]['Relationships'], TName, K> | RecursivelyFindRelationships<Schema, TName, Exclude<Keys, K>> : false : false;
type FilterRelationships<R$1, TName, From$1> = R$1 extends readonly (infer Rel)[] ? Rel extends {
  referencedRelation: TName;
} ? Rel & {
  from: From$1;
} : never : never;
type ResolveForwardRelationship<Schema extends GenericSchema, Field$1 extends Ast.FieldNode, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string> = FindFieldMatchingRelationships<Schema, TablesAndViews$2<Schema>[Field$1['name']]['Relationships'], Ast.FieldNode & {
  name: CurrentTableOrView;
  hint: Field$1['hint'];
}> extends infer FoundByName ? FoundByName extends GenericRelationship ? {
  referencedTable: TablesAndViews$2<Schema>[Field$1['name']];
  relation: FoundByName;
  direction: 'forward';
  from: Field$1['name'];
  type: 'found-by-name';
} : FindFieldMatchingRelationships<Schema, TableForwardRelationships<Schema, CurrentTableOrView>, Field$1> extends infer FoundByMatch ? FoundByMatch extends GenericRelationship & {
  from: keyof TablesAndViews$2<Schema>;
} ? {
  referencedTable: TablesAndViews$2<Schema>[FoundByMatch['from']];
  relation: FoundByMatch;
  direction: 'forward';
  from: CurrentTableOrView;
  type: 'found-by-match';
} : FindJoinTableRelationship<Schema, CurrentTableOrView, Field$1['name']> extends infer FoundByJoinTable ? FoundByJoinTable extends GenericRelationship ? {
  referencedTable: TablesAndViews$2<Schema>[FoundByJoinTable['referencedRelation']];
  relation: FoundByJoinTable & {
    match: 'refrel';
  };
  direction: 'forward';
  from: CurrentTableOrView;
  type: 'found-by-join-table';
} : ResolveEmbededFunctionJoinTableRelationship<Schema, CurrentTableOrView, Field$1['name']> extends infer FoundEmbededFunctionJoinTableRelation ? FoundEmbededFunctionJoinTableRelation extends GenericSetofOption ? {
  referencedTable: TablesAndViews$2<Schema>[FoundEmbededFunctionJoinTableRelation['to']];
  relation: {
    foreignKeyName: `${Field$1['name']}_${CurrentTableOrView}_${FoundEmbededFunctionJoinTableRelation['to']}_forward`;
    columns: [];
    isOneToOne: FoundEmbededFunctionJoinTableRelation['isOneToOne'] extends true ? true : false;
    referencedColumns: [];
    referencedRelation: FoundEmbededFunctionJoinTableRelation['to'];
  } & {
    match: 'func';
    isNotNullable: FoundEmbededFunctionJoinTableRelation['isNotNullable'] extends true ? true : FoundEmbededFunctionJoinTableRelation['isSetofReturn'] extends true ? false : true;
    isSetofReturn: FoundEmbededFunctionJoinTableRelation['isSetofReturn'];
  };
  direction: 'forward';
  from: CurrentTableOrView;
  type: 'found-by-embeded-function';
} : SelectQueryError<`could not find the relation between ${CurrentTableOrView} and ${Field$1['name']}`> : SelectQueryError<`could not find the relation between ${CurrentTableOrView} and ${Field$1['name']}`> : SelectQueryError<`could not find the relation between ${CurrentTableOrView} and ${Field$1['name']}`> : SelectQueryError<`could not find the relation between ${CurrentTableOrView} and ${Field$1['name']}`> : SelectQueryError<`could not find the relation between ${CurrentTableOrView} and ${Field$1['name']}`>;
/**
 * Given a CurrentTableOrView, finds all join tables to this relation.
 * For example, if products and categories are linked via product_categories table:
 *
 * @example
 * Given:
 * - CurrentTableView = 'products'
 * - FieldName = "categories"
 *
 * It should return this relationship from product_categories:
 * {
 *   foreignKeyName: "product_categories_category_id_fkey",
 *   columns: ["category_id"],
 *   isOneToOne: false,
 *   referencedRelation: "categories",
 *   referencedColumns: ["id"]
 * }
 */
type ResolveJoinTableRelationship<Schema extends GenericSchema, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string, FieldName$1 extends string> = { [TableName in keyof TablesAndViews$2<Schema>]: DeduplicateRelationships<TablesAndViews$2<Schema>[TableName]['Relationships']> extends readonly (infer Rel)[] ? Rel extends {
  referencedRelation: CurrentTableOrView;
} ? DeduplicateRelationships<TablesAndViews$2<Schema>[TableName]['Relationships']> extends readonly (infer OtherRel)[] ? OtherRel extends {
  referencedRelation: FieldName$1;
} ? OtherRel : never : never : never : never }[keyof TablesAndViews$2<Schema>];
type ResolveEmbededFunctionJoinTableRelationship<Schema extends GenericSchema, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string, FieldName$1 extends string> = FindMatchingFunctionBySetofFrom<Schema['Functions'][FieldName$1], CurrentTableOrView> extends infer Fn ? Fn extends GenericFunction ? Fn['SetofOptions'] : false : false;
type FindJoinTableRelationship<Schema extends GenericSchema, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string, FieldName$1 extends string> = ResolveJoinTableRelationship<Schema, CurrentTableOrView, FieldName$1> extends infer Result ? [Result] extends [never] ? false : Result : never;
/**
 * Finds a matching relationship based on the FieldNode's name and optional hint.
 */
type FindFieldMatchingRelationships<Schema extends GenericSchema, Relationships extends GenericRelationship[], Field$1 extends Ast.FieldNode> = Field$1 extends {
  hint: string;
} ? FindMatchingHintTableRelationships<Schema, Relationships, Field$1['hint'], Field$1['name']> extends GenericRelationship ? FindMatchingHintTableRelationships<Schema, Relationships, Field$1['hint'], Field$1['name']> & {
  branch: 'found-in-table-via-hint';
  hint: Field$1['hint'];
} : FindMatchingHintViewRelationships<Schema, Relationships, Field$1['hint'], Field$1['name']> extends GenericRelationship ? FindMatchingHintViewRelationships<Schema, Relationships, Field$1['hint'], Field$1['name']> & {
  branch: 'found-in-view-via-hint';
  hint: Field$1['hint'];
} : SelectQueryError<'Failed to find matching relation via hint'> : FindMatchingTableRelationships<Schema, Relationships, Field$1['name']> extends GenericRelationship ? FindMatchingTableRelationships<Schema, Relationships, Field$1['name']> & {
  branch: 'found-in-table-via-name';
  name: Field$1['name'];
} : FindMatchingViewRelationships<Schema, Relationships, Field$1['name']> extends GenericRelationship ? FindMatchingViewRelationships<Schema, Relationships, Field$1['name']> & {
  branch: 'found-in-view-via-name';
  name: Field$1['name'];
} : SelectQueryError<'Failed to find matching relation via name'>;
type JsonPathToAccessor<Path extends string> = Path extends `${infer P1}->${infer P2}` ? P2 extends `>${infer Rest}` ? JsonPathToAccessor<`${P1}.${Rest}`> : P2 extends string ? JsonPathToAccessor<`${P1}.${P2}`> : Path : Path extends `>${infer Rest}` ? JsonPathToAccessor<Rest> : Path extends `${infer P1}::${infer _}` ? JsonPathToAccessor<P1> : Path extends `${infer P1}${')' | ','}${infer _}` ? P1 : Path;
type JsonPathToType<T, Path extends string> = Path extends '' ? T : ContainsNull<T> extends true ? JsonPathToType<Exclude<T, null>, Path> : Path extends `${infer Key}.${infer Rest}` ? Key extends keyof T ? JsonPathToType<T[Key], Rest> : never : Path extends keyof T ? T[Path] : never;
type IsStringUnion<T> = string extends T ? false : T extends string ? [T] extends [never] ? false : true : false;
type MatchingFunctionBySetofFrom<Fn$1 extends GenericFunction, TableName$1 extends string> = Fn$1['SetofOptions'] extends GenericSetofOption ? TableName$1 extends Fn$1['SetofOptions']['from'] ? Fn$1 : never : false;
type FindMatchingFunctionBySetofFrom<FnUnion, TableName$1 extends string> = FnUnion extends infer Fn extends GenericFunction ? MatchingFunctionBySetofFrom<Fn, TableName$1> : false;
type ComputedField<Schema extends GenericSchema, RelationName extends keyof TablesAndViews$2<Schema>, FieldName$1 extends keyof TablesAndViews$2<Schema>[RelationName]['Row']> = FieldName$1 extends keyof Schema['Functions'] ? Schema['Functions'][FieldName$1] extends {
  Args: {
    '': TablesAndViews$2<Schema>[RelationName]['Row'];
  };
  Returns: any;
} ? FieldName$1 : never : never;
type GetComputedFields<Schema extends GenericSchema, RelationName extends keyof TablesAndViews$2<Schema>> = { [K in keyof TablesAndViews$2<Schema>[RelationName]['Row']]: ComputedField<Schema, RelationName, K> }[keyof TablesAndViews$2<Schema>[RelationName]['Row']];
//#endregion
//#region src/types/types.d.ts
/**
 * Response format
 *
 * {@link https://github.com/supabase/supabase-js/issues/32}
 */
interface PostgrestResponseBase {
  status: number;
  statusText: string;
}
interface PostgrestResponseSuccess<T> extends PostgrestResponseBase {
  error: null;
  data: T;
  count: number | null;
}
interface PostgrestResponseFailure extends PostgrestResponseBase {
  error: PostgrestError;
  data: null;
  count: null;
}
type PostgrestSingleResponse<T> = PostgrestResponseSuccess<T> | PostgrestResponseFailure;
type PostgrestMaybeSingleResponse<T> = PostgrestSingleResponse<T | null>;
type PostgrestResponse<T> = PostgrestSingleResponse<T[]>;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type SimplifyDeep<Type, ExcludeType = never> = ConditionalSimplifyDeep<Type, ExcludeType | NonRecursiveType | Set<unknown> | Map<unknown, unknown>, object>;
type ConditionalSimplifyDeep<Type, ExcludeType = never, IncludeType = unknown> = Type extends ExcludeType ? Type : Type extends IncludeType ? { [TypeKey in keyof Type]: ConditionalSimplifyDeep<Type[TypeKey], ExcludeType, IncludeType> } : Type;
type NonRecursiveType = BuiltIns | Function | (new (...arguments_: any[]) => unknown);
type BuiltIns = Primitive | void | Date | RegExp;
type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type IsValidResultOverride<Result$1, NewResult, ErrorResult, ErrorNewResult> = Result$1 extends any[] ? NewResult extends any[] ? true : ErrorResult : NewResult extends any[] ? ErrorNewResult : true;
/**
 * Utility type to check if array types match between Result and NewResult.
 * Returns either the valid NewResult type or an error message type.
 */
type CheckMatchingArrayTypes<Result$1, NewResult> = Result$1 extends SelectQueryError<string> ? NewResult : IsValidResultOverride<Result$1, NewResult, {
  Error: 'Type mismatch: Cannot cast array result to a single object. Use .overrideTypes<Array<YourType>> or .returns<Array<YourType>> (deprecated) for array results or .single() to convert the result to a single object';
}, {
  Error: 'Type mismatch: Cannot cast single object to array type. Remove Array wrapper from return type or make sure you are not using .single() up in the calling chain';
}> extends infer ValidationResult ? ValidationResult extends true ? ContainsNull<Result$1> extends true ? NewResult | null : NewResult : ValidationResult : never;
type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;
type ExplicitKeys<T> = { [K in keyof T]: string extends K ? never : K }[keyof T];
type MergeExplicit<New, Row> = { [K in ExplicitKeys<New> | ExplicitKeys<Row>]: K extends keyof New ? K extends keyof Row ? Row[K] extends SelectQueryError<string> ? New[K] : New[K] extends any[] ? Row[K] extends any[] ? Array<Simplify<MergeDeep<NonNullable<New[K][number]>, NonNullable<Row[K][number]>>>> : New[K] : IsPlainObject<NonNullable<New[K]>> extends true ? IsPlainObject<NonNullable<Row[K]>> extends true ? ContainsNull<New[K]> extends true ?
// If the override wants to preserve optionality
Simplify<MergeDeep<NonNullable<New[K]>, NonNullable<Row[K]>>> | null : Simplify<MergeDeep<New[K], NonNullable<Row[K]>>> : New[K] : New[K] : New[K] : K extends keyof Row ? Row[K] : never };
type MergeDeep<New, Row> = Simplify<MergeExplicit<New, Row> & (string extends keyof Row ? {
  [K: string]: Row[string];
} : {})>;
type IsPlainObject<T> = T extends any[] ? false : T extends object ? true : false;
type MergePartialResult<NewResult, Result$1, Options> = Options extends {
  merge: true;
} ? Result$1 extends any[] ? NewResult extends any[] ? Array<Simplify<MergeDeep<NewResult[number], Result$1[number]>>> : never : Simplify<MergeDeep<NewResult, Result$1>> : NewResult;
//#endregion
//#region src/PostgrestBuilder.d.ts
declare abstract class PostgrestBuilder<ClientOptions extends ClientServerOptions, Result$1, ThrowOnError extends boolean = false> implements PromiseLike<ThrowOnError extends true ? PostgrestResponseSuccess<Result$1> : PostgrestSingleResponse<Result$1>> {
  protected method: 'GET' | 'HEAD' | 'POST' | 'PATCH' | 'DELETE';
  protected url: URL;
  protected headers: Headers;
  protected schema?: string;
  protected body?: unknown;
  protected shouldThrowOnError: boolean;
  protected signal?: AbortSignal;
  protected fetch: Fetch;
  protected isMaybeSingle: boolean;
  protected urlLengthLimit: number;
  /**
   * Creates a builder configured for a specific PostgREST request.
   *
   * @example
   * ```ts
   * import PostgrestQueryBuilder from '@supabase/postgrest-js'
   *
   * const builder = new PostgrestQueryBuilder(
   *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
   *   { headers: new Headers({ apikey: 'public-anon-key' }) }
   * )
   * ```
   */
  constructor(builder: {
    method: 'GET' | 'HEAD' | 'POST' | 'PATCH' | 'DELETE';
    url: URL;
    headers: HeadersInit;
    schema?: string;
    body?: unknown;
    shouldThrowOnError?: boolean;
    signal?: AbortSignal;
    fetch?: Fetch;
    isMaybeSingle?: boolean;
    urlLengthLimit?: number;
  });
  /**
   * If there's an error with the query, throwOnError will reject the promise by
   * throwing the error instead of returning it as part of a successful response.
   *
   * {@link https://github.com/supabase/supabase-js/issues/92}
   */
  throwOnError(): this & PostgrestBuilder<ClientOptions, Result$1, true>;
  /**
   * Set an HTTP header for the request.
   */
  setHeader(name: string, value: string): this;
  then<TResult1 = (ThrowOnError extends true ? PostgrestResponseSuccess<Result$1> : PostgrestSingleResponse<Result$1>), TResult2 = never>(onfulfilled?: ((value: ThrowOnError extends true ? PostgrestResponseSuccess<Result$1> : PostgrestSingleResponse<Result$1>) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
  /**
   * Override the type of the returned `data`.
   *
   * @typeParam NewResult - The new result type to override with
   * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
   */
  returns<NewResult>(): PostgrestBuilder<ClientOptions, CheckMatchingArrayTypes<Result$1, NewResult>, ThrowOnError>;
  /**
   * Override the type of the returned `data` field in the response.
   *
   * @typeParam NewResult - The new type to cast the response data to
   * @typeParam Options - Optional type configuration (defaults to { merge: true })
   * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
   * @example
   * ```typescript
   * // Merge with existing types (default behavior)
   * const query = supabase
   *   .from('users')
   *   .select()
   *   .overrideTypes<{ custom_field: string }>()
   *
   * // Replace existing types completely
   * const replaceQuery = supabase
   *   .from('users')
   *   .select()
   *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
   * ```
   * @returns A PostgrestBuilder instance with the new type
   */
  overrideTypes<NewResult, Options extends {
    merge?: boolean;
  } = {
    merge: true;
  }>(): PostgrestBuilder<ClientOptions, IsValidResultOverride<Result$1, NewResult, false, false> extends true ? ContainsNull<Result$1> extends true ? MergePartialResult<NewResult, NonNullable<Result$1>, Options> | null : MergePartialResult<NewResult, Result$1, Options> : CheckMatchingArrayTypes<Result$1, NewResult>, ThrowOnError>;
}
//#endregion
//#region src/types/feature-flags.d.ts
type IsPostgrest13<PostgrestVersion extends string | undefined> = PostgrestVersion extends `13${string}` ? true : false;
type IsPostgrest14<PostgrestVersion extends string | undefined> = PostgrestVersion extends `14${string}` ? true : false;
type IsPostgrestVersionGreaterThan12<PostgrestVersion extends string | undefined> = IsPostgrest13<PostgrestVersion> extends true ? true : IsPostgrest14<PostgrestVersion> extends true ? true : false;
type MaxAffectedEnabled<PostgrestVersion extends string | undefined> = IsPostgrestVersionGreaterThan12<PostgrestVersion> extends true ? true : false;
type SpreadOnManyEnabled<PostgrestVersion extends string | undefined> = IsPostgrestVersionGreaterThan12<PostgrestVersion> extends true ? true : false;
//#endregion
//#region src/select-query-parser/result.d.ts
/**
 * Main entry point for constructing the result type of a PostgREST query.
 *
 * @param Schema - Database schema.
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Relationships - Relationships of the current table.
 * @param Query - The select query string literal to parse.
 */
type GetResult<Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName, Relationships, Query extends string, ClientOptions extends ClientServerOptions> = IsAny$1<Schema> extends true ? ParseQuery<Query> extends infer ParsedQuery ? ParsedQuery extends Ast.Node[] ? RelationName extends string ? ProcessNodesWithoutSchema<ParsedQuery> : any : ParsedQuery : any : Relationships extends null ? ParseQuery<Query> extends infer ParsedQuery ? ParsedQuery extends Ast.Node[] ? RPCCallNodes<ParsedQuery, RelationName extends string ? RelationName : 'rpc_call', Row> : ParsedQuery : Row : ParseQuery<Query> extends infer ParsedQuery ? ParsedQuery extends Ast.Node[] ? RelationName extends string ? Relationships extends GenericRelationship[] ? ProcessNodes<ClientOptions, Schema, Row, RelationName, Relationships, ParsedQuery> : SelectQueryError<'Invalid Relationships cannot infer result type'> : SelectQueryError<'Invalid RelationName cannot infer result type'> : ParsedQuery : never;
type ProcessSimpleFieldWithoutSchema<Field$1 extends Ast.FieldNode> = Field$1['aggregateFunction'] extends AggregateFunctions ? { [K in GetFieldNodeResultName<Field$1>]: Field$1['castType'] extends PostgreSQLTypes ? TypeScriptTypes<Field$1['castType']> : number } : { [K in GetFieldNodeResultName<Field$1>]: Field$1['castType'] extends PostgreSQLTypes ? TypeScriptTypes<Field$1['castType']> : any };
type ProcessFieldNodeWithoutSchema<Node$1 extends Ast.FieldNode> = IsNonEmptyArray<Node$1['children']> extends true ? { [K in GetFieldNodeResultName<Node$1>]: Node$1['children'] extends Ast.Node[] ? ProcessNodesWithoutSchema<Node$1['children']>[] : ProcessSimpleFieldWithoutSchema<Node$1> } : ProcessSimpleFieldWithoutSchema<Node$1>;
/**
 * Processes a single Node without schema and returns the resulting TypeScript type.
 */
type ProcessNodeWithoutSchema<Node$1 extends Ast.Node> = Node$1 extends Ast.StarNode ? any : Node$1 extends Ast.SpreadNode ? Node$1['target']['children'] extends Ast.StarNode[] ? any : Node$1['target']['children'] extends Ast.FieldNode[] ? { [P in Node$1['target']['children'][number] as GetFieldNodeResultName<P>]: P['castType'] extends PostgreSQLTypes ? TypeScriptTypes<P['castType']> : any } : any : Node$1 extends Ast.FieldNode ? ProcessFieldNodeWithoutSchema<Node$1> : any;
/**
 * Processes nodes when Schema is any, providing basic type inference
 */
type ProcessNodesWithoutSchema<Nodes$1 extends Ast.Node[], Acc extends Record<string, unknown> = {}> = Nodes$1 extends [infer FirstNode, ...infer RestNodes] ? FirstNode extends Ast.Node ? RestNodes extends Ast.Node[] ? ProcessNodeWithoutSchema<FirstNode> extends infer FieldResult ? FieldResult extends Record<string, unknown> ? ProcessNodesWithoutSchema<RestNodes, Acc & FieldResult> : FieldResult : any : any : any : Prettify<Acc>;
/**
 * Processes a single Node from a select chained after a rpc call
 *
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current rpc function
 * @param NodeType - The Node to process.
 */
type ProcessRPCNode<Row extends Record<string, unknown>, RelationName extends string, NodeType extends Ast.Node> = NodeType['type'] extends Ast.StarNode['type'] ? Row : NodeType['type'] extends Ast.FieldNode['type'] ? ProcessSimpleField<Row, RelationName, Extract<NodeType, Ast.FieldNode>> : SelectQueryError<'RPC Unsupported node type.'>;
/**
 * Process select call that can be chained after an rpc call
 */
type RPCCallNodes<Nodes$1 extends Ast.Node[], RelationName extends string, Row extends Record<string, unknown>, Acc extends Record<string, unknown> = {}> = Nodes$1 extends [infer FirstNode, ...infer RestNodes] ? FirstNode extends Ast.Node ? RestNodes extends Ast.Node[] ? ProcessRPCNode<Row, RelationName, FirstNode> extends infer FieldResult ? FieldResult extends Record<string, unknown> ? RPCCallNodes<RestNodes, RelationName, Row, Acc & FieldResult> : FieldResult extends SelectQueryError<infer E> ? SelectQueryError<E> : SelectQueryError<'Could not retrieve a valid record or error value'> : SelectQueryError<'Processing node failed.'> : SelectQueryError<'Invalid rest nodes array in RPC call'> : SelectQueryError<'Invalid first node in RPC call'> : Prettify<Acc>;
/**
 * Recursively processes an array of Nodes and accumulates the resulting TypeScript type.
 *
 * @param Schema - Database schema.
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Relationships - Relationships of the current table.
 * @param Nodes - An array of AST nodes to process.
 * @param Acc - Accumulator for the constructed type.
 */
type ProcessNodes<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName extends string, Relationships extends GenericRelationship[], Nodes$1 extends Ast.Node[], Acc extends Record<string, unknown> = {}> = CheckDuplicateEmbededReference<Schema, RelationName, Relationships, Nodes$1> extends false ? Nodes$1 extends [infer FirstNode, ...infer RestNodes] ? FirstNode extends Ast.Node ? RestNodes extends Ast.Node[] ? ProcessNode<ClientOptions, Schema, Row, RelationName, Relationships, FirstNode> extends infer FieldResult ? FieldResult extends Record<string, unknown> ? ProcessNodes<ClientOptions, Schema, Row, RelationName, Relationships, RestNodes, Acc & FieldResult> : FieldResult extends SelectQueryError<infer E> ? SelectQueryError<E> : SelectQueryError<'Could not retrieve a valid record or error value'> : SelectQueryError<'Processing node failed.'> : SelectQueryError<'Invalid rest nodes array type in ProcessNodes'> : SelectQueryError<'Invalid first node type in ProcessNodes'> : Prettify<Acc> : Prettify<CheckDuplicateEmbededReference<Schema, RelationName, Relationships, Nodes$1>>;
/**
 * Processes a single Node and returns the resulting TypeScript type.
 *
 * @param Schema - Database schema.
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Relationships - Relationships of the current table.
 * @param NodeType - The Node to process.
 */
type ProcessNode<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName extends string, Relationships extends GenericRelationship[], NodeType extends Ast.Node> = NodeType['type'] extends Ast.StarNode['type'] ? GetComputedFields<Schema, RelationName> extends never ? Row : Omit<Row, GetComputedFields<Schema, RelationName>> : NodeType['type'] extends Ast.SpreadNode['type'] ? ProcessSpreadNode<ClientOptions, Schema, Row, RelationName, Relationships, Extract<NodeType, Ast.SpreadNode>> : NodeType['type'] extends Ast.FieldNode['type'] ? ProcessFieldNode<ClientOptions, Schema, Row, RelationName, Relationships, Extract<NodeType, Ast.FieldNode>> : SelectQueryError<'Unsupported node type.'>;
/**
 * Processes a FieldNode and returns the resulting TypeScript type.
 *
 * @param Schema - Database schema.
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Relationships - Relationships of the current table.
 * @param Field - The FieldNode to process.
 */
type ProcessFieldNode<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName extends string, Relationships extends GenericRelationship[], Field$1 extends Ast.FieldNode> = Field$1['children'] extends [] ? {} : IsNonEmptyArray<Field$1['children']> extends true ? ProcessEmbeddedResource<ClientOptions, Schema, Relationships, Field$1, RelationName> : ProcessSimpleField<Row, RelationName, Field$1>;
type ResolveJsonPathType<Value, Path extends string | undefined, CastType$1 extends PostgreSQLTypes> = Path extends string ? JsonPathToType<Value, Path> extends never ? TypeScriptTypes<CastType$1> : JsonPathToType<Value, Path> extends infer PathResult ? PathResult extends string ? PathResult : IsStringUnion<PathResult> extends true ? PathResult : CastType$1 extends 'json' ? PathResult : TypeScriptTypes<CastType$1> : TypeScriptTypes<CastType$1> : TypeScriptTypes<CastType$1>;
/**
 * Processes a simple field (without embedded resources).
 *
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Field - The FieldNode to process.
 */
type ProcessSimpleField<Row extends Record<string, unknown>, RelationName extends string, Field$1 extends Ast.FieldNode> = Field$1['name'] extends keyof Row | 'count' ? Field$1['aggregateFunction'] extends AggregateFunctions ? { [K in GetFieldNodeResultName<Field$1>]: Field$1['castType'] extends PostgreSQLTypes ? TypeScriptTypes<Field$1['castType']> : number } : { [K in GetFieldNodeResultName<Field$1>]: Field$1['castType'] extends PostgreSQLTypes ? ResolveJsonPathType<Row[Field$1['name']], Field$1['jsonPath'], Field$1['castType']> : Row[Field$1['name']] } : SelectQueryError<`column '${Field$1['name']}' does not exist on '${RelationName}'.`>;
/**
 * Processes an embedded resource (relation).
 *
 * @param Schema - Database schema.
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Relationships - Relationships of the current table.
 * @param Field - The FieldNode to process.
 */
type ProcessEmbeddedResource<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Relationships extends GenericRelationship[], Field$1 extends Ast.FieldNode, CurrentTableOrView extends keyof TablesAndViews$2<Schema> & string> = ResolveRelationship<Schema, Relationships, Field$1, CurrentTableOrView> extends infer Resolved ? Resolved extends {
  referencedTable: Pick<GenericTable, 'Row' | 'Relationships'>;
  relation: GenericRelationship & {
    match: 'refrel' | 'col' | 'fkname' | 'func';
  };
  direction: string;
} ? ProcessEmbeddedResourceResult<ClientOptions, Schema, Resolved, Field$1, CurrentTableOrView> : { [K in GetFieldNodeResultName<Field$1>]: Resolved } : { [K in GetFieldNodeResultName<Field$1>]: SelectQueryError<'Failed to resolve relationship.'> & string };
/**
 * Helper type to process the result of an embedded resource.
 */
type ProcessEmbeddedResourceResult<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Resolved$1 extends {
  referencedTable: Pick<GenericTable, 'Row' | 'Relationships'>;
  relation: GenericRelationship & {
    match: 'refrel' | 'col' | 'fkname' | 'func';
    isNotNullable?: boolean;
    referencedRelation: string;
    isSetofReturn?: boolean;
  };
  direction: string;
}, Field$1 extends Ast.FieldNode, CurrentTableOrView extends keyof TablesAndViews$2<Schema>> = ProcessNodes<ClientOptions, Schema, Resolved$1['referencedTable']['Row'], Resolved$1['relation']['match'] extends 'func' ? Resolved$1['relation']['referencedRelation'] : Field$1['name'], Resolved$1['referencedTable']['Relationships'], Field$1['children'] extends undefined ? [] : Exclude<Field$1['children'], undefined> extends Ast.Node[] ? Exclude<Field$1['children'], undefined> : []> extends infer ProcessedChildren ? { [K in GetFieldNodeResultName<Field$1>]: Resolved$1['direction'] extends 'forward' ? Field$1 extends {
  innerJoin: true;
} ? Resolved$1['relation']['isOneToOne'] extends true ? ProcessedChildren : ProcessedChildren[] : Resolved$1['relation']['isOneToOne'] extends true ? Resolved$1['relation']['match'] extends 'func' ? Resolved$1['relation']['isNotNullable'] extends true ? Resolved$1['relation']['isSetofReturn'] extends true ? ProcessedChildren : { [P in keyof ProcessedChildren]: ProcessedChildren[P] | null } : ProcessedChildren | null : ProcessedChildren | null : ProcessedChildren[] : Resolved$1['relation']['referencedRelation'] extends CurrentTableOrView ? Resolved$1['relation']['match'] extends 'col' ? IsRelationNullable<TablesAndViews$2<Schema>[CurrentTableOrView], Resolved$1['relation']> extends true ? ProcessedChildren | null : ProcessedChildren : ProcessedChildren[] : IsRelationNullable<TablesAndViews$2<Schema>[CurrentTableOrView], Resolved$1['relation']> extends true ? Field$1 extends {
  innerJoin: true;
} ? ProcessedChildren : ProcessedChildren | null : ProcessedChildren } : { [K in GetFieldNodeResultName<Field$1>]: SelectQueryError<'Failed to process embedded resource nodes.'> & string };
/**
 * Processes a SpreadNode by processing its target node.
 *
 * @param Schema - Database schema.
 * @param Row - The type of a row in the current table.
 * @param RelationName - The name of the current table or view.
 * @param Relationships - Relationships of the current table.
 * @param Spread - The SpreadNode to process.
 */
type ProcessSpreadNode<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName extends string, Relationships extends GenericRelationship[], Spread extends Ast.SpreadNode> = ProcessNode<ClientOptions, Schema, Row, RelationName, Relationships, Spread['target']> extends infer Result ? Result extends SelectQueryError<infer E> ? SelectQueryError<E> : ExtractFirstProperty<Result> extends unknown[] ? SpreadOnManyEnabled<ClientOptions['PostgrestVersion']> extends true ? ProcessManyToManySpreadNodeResult<Result> : { [K in Spread['target']['name']]: SelectQueryError<`"${RelationName}" and "${Spread['target']['name']}" do not form a many-to-one or one-to-one relationship spread not possible`> } : ProcessSpreadNodeResult<Result> : never;
/**
 * Helper type to process the result of a many-to-many spread node.
 * Converts all fields in the spread object into arrays.
 */
type ProcessManyToManySpreadNodeResult<Result$1> = Result$1 extends Record<string, SelectQueryError<string> | null> ? Result$1 : ExtractFirstProperty<Result$1> extends infer SpreadedObject ? SpreadedObject extends Array<Record<string, unknown>> ? { [K in keyof SpreadedObject[number]]: Array<SpreadedObject[number][K]> } : SelectQueryError<'An error occurred spreading the many-to-many object'> : SelectQueryError<'An error occurred spreading the many-to-many object'>;
/**
 * Helper type to process the result of a spread node.
 */
type ProcessSpreadNodeResult<Result$1> = Result$1 extends Record<string, SelectQueryError<string> | null> ? Result$1 : ExtractFirstProperty<Result$1> extends infer SpreadedObject ? ContainsNull<SpreadedObject> extends true ? Exclude<{ [K in keyof SpreadedObject]: SpreadedObject[K] | null }, null> : Exclude<{ [K in keyof SpreadedObject]: SpreadedObject[K] }, null> : SelectQueryError<'An error occurred spreading the object'>;
//#endregion
//#region src/PostgrestTransformBuilder.d.ts
declare class PostgrestTransformBuilder<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Row extends Record<string, unknown>, Result$1, RelationName = unknown, Relationships = unknown, Method = unknown> extends PostgrestBuilder<ClientOptions, Result$1> {
  /**
   * Perform a SELECT on the query result.
   *
   * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
   * return modified rows. By calling this method, modified rows are returned in
   * `data`.
   *
   * @param columns - The columns to retrieve, separated by commas
   */
  select<Query extends string = '*', NewResultOne = GetResult<Schema, Row, RelationName, Relationships, Query, ClientOptions>>(columns?: Query): PostgrestFilterBuilder<ClientOptions, Schema, Row, Method extends 'RPC' ? Result$1 extends unknown[] ? NewResultOne[] : NewResultOne : NewResultOne[], RelationName, Relationships, Method>;
  order<ColumnName extends string & keyof Row>(column: ColumnName, options?: {
    ascending?: boolean;
    nullsFirst?: boolean;
    referencedTable?: undefined;
  }): this;
  order(column: string, options?: {
    ascending?: boolean;
    nullsFirst?: boolean;
    referencedTable?: string;
  }): this;
  /**
   * @deprecated Use `options.referencedTable` instead of `options.foreignTable`
   */
  order<ColumnName extends string & keyof Row>(column: ColumnName, options?: {
    ascending?: boolean;
    nullsFirst?: boolean;
    foreignTable?: undefined;
  }): this;
  /**
   * @deprecated Use `options.referencedTable` instead of `options.foreignTable`
   */
  order(column: string, options?: {
    ascending?: boolean;
    nullsFirst?: boolean;
    foreignTable?: string;
  }): this;
  /**
   * Limit the query result by `count`.
   *
   * @param count - The maximum number of rows to return
   * @param options - Named parameters
   * @param options.referencedTable - Set this to limit rows of referenced
   * tables instead of the parent table
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  limit(count: number, {
    foreignTable,
    referencedTable
  }?: {
    foreignTable?: string;
    referencedTable?: string;
  }): this;
  /**
   * Limit the query result by starting at an offset `from` and ending at the offset `to`.
   * Only records within this range are returned.
   * This respects the query order and if there is no order clause the range could behave unexpectedly.
   * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
   * and fourth rows of the query.
   *
   * @param from - The starting index from which to limit the result
   * @param to - The last index to which to limit the result
   * @param options - Named parameters
   * @param options.referencedTable - Set this to limit rows of referenced
   * tables instead of the parent table
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  range(from: number, to: number, {
    foreignTable,
    referencedTable
  }?: {
    foreignTable?: string;
    referencedTable?: string;
  }): this;
  /**
   * Set the AbortSignal for the fetch request.
   *
   * @param signal - The AbortSignal to use for the fetch request
   */
  abortSignal(signal: AbortSignal): this;
  /**
   * Return `data` as a single object instead of an array of objects.
   *
   * Query result must be one row (e.g. using `.limit(1)`), otherwise this
   * returns an error.
   */
  single<ResultOne = (Result$1 extends (infer ResultOne)[] ? ResultOne : never)>(): PostgrestBuilder<ClientOptions, ResultOne>;
  /**
   * Return `data` as a single object instead of an array of objects.
   *
   * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
   * this returns an error.
   */
  maybeSingle<ResultOne = (Result$1 extends (infer ResultOne)[] ? ResultOne : never)>(): PostgrestBuilder<ClientOptions, ResultOne | null>;
  /**
   * Return `data` as a string in CSV format.
   */
  csv(): PostgrestBuilder<ClientOptions, string>;
  /**
   * Return `data` as an object in [GeoJSON](https://geojson.org) format.
   */
  geojson(): PostgrestBuilder<ClientOptions, Record<string, unknown>>;
  /**
   * Return `data` as the EXPLAIN plan for the query.
   *
   * You need to enable the
   * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
   * setting before using this method.
   *
   * @param options - Named parameters
   *
   * @param options.analyze - If `true`, the query will be executed and the
   * actual run time will be returned
   *
   * @param options.verbose - If `true`, the query identifier will be returned
   * and `data` will include the output columns of the query
   *
   * @param options.settings - If `true`, include information on configuration
   * parameters that affect query planning
   *
   * @param options.buffers - If `true`, include information on buffer usage
   *
   * @param options.wal - If `true`, include information on WAL record generation
   *
   * @param options.format - The format of the output, can be `"text"` (default)
   * or `"json"`
   */
  explain({
    analyze,
    verbose,
    settings,
    buffers,
    wal,
    format
  }?: {
    analyze?: boolean;
    verbose?: boolean;
    settings?: boolean;
    buffers?: boolean;
    wal?: boolean;
    format?: 'json' | 'text';
  }): PostgrestBuilder<ClientOptions, Record<string, unknown>[], false> | PostgrestBuilder<ClientOptions, string, false>;
  /**
   * Rollback the query.
   *
   * `data` will still be returned, but the query is not committed.
   */
  rollback(): this;
  /**
   * Override the type of the returned `data`.
   *
   * @typeParam NewResult - The new result type to override with
   * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
   */
  returns<NewResult>(): PostgrestTransformBuilder<ClientOptions, Schema, Row, CheckMatchingArrayTypes<Result$1, NewResult>, RelationName, Relationships, Method>;
  /**
   * Set the maximum number of rows that can be affected by the query.
   * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
   *
   * @param value - The maximum number of rows that can be affected
   */
  maxAffected(value: number): MaxAffectedEnabled<ClientOptions['PostgrestVersion']> extends true ? Method extends 'PATCH' | 'DELETE' | 'RPC' ? this : InvalidMethodError<'maxAffected method only available on update or delete'> : InvalidMethodError<'maxAffected method only available on postgrest 13+'>;
}
//#endregion
//#region src/PostgrestFilterBuilder.d.ts
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'isdistinct' | 'in' | 'cs' | 'cd' | 'sl' | 'sr' | 'nxl' | 'nxr' | 'adj' | 'ov' | 'fts' | 'plfts' | 'phfts' | 'wfts' | 'match' | 'imatch';
type IsStringOperator<Path extends string> = Path extends `${string}->>${string}` ? true : false;
type ResolveFilterValue<Schema extends GenericSchema, Row extends Record<string, unknown>, ColumnName extends string> = ColumnName extends `${infer RelationshipTable}.${infer Remainder}` ? Remainder extends `${infer _}.${infer _}` ? ResolveFilterValue<Schema, Row, Remainder> : ResolveFilterRelationshipValue<Schema, RelationshipTable, Remainder> : ColumnName extends keyof Row ? Row[ColumnName] : IsStringOperator<ColumnName> extends true ? string : JsonPathToType<Row, JsonPathToAccessor<ColumnName>> extends infer JsonPathValue ? JsonPathValue extends never ? never : JsonPathValue : never;
type ResolveFilterRelationshipValue<Schema extends GenericSchema, RelationshipTable$1 extends string, RelationshipColumn extends string> = Schema['Tables'] & Schema['Views'] extends infer TablesAndViews ? RelationshipTable$1 extends keyof TablesAndViews ? 'Row' extends keyof TablesAndViews[RelationshipTable$1] ? RelationshipColumn extends keyof TablesAndViews[RelationshipTable$1]['Row'] ? TablesAndViews[RelationshipTable$1]['Row'][RelationshipColumn] : unknown : unknown : unknown : never;
type InvalidMethodError<S extends string> = {
  Error: S;
};
declare class PostgrestFilterBuilder<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Row extends Record<string, unknown>, Result$1, RelationName = unknown, Relationships = unknown, Method = unknown> extends PostgrestTransformBuilder<ClientOptions, Schema, Row, Result$1, RelationName, Relationships, Method> {
  /**
   * Match only rows where `column` is equal to `value`.
   *
   * To check if the value of `column` is NULL, you should use `.is()` instead.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  eq<ColumnName extends string>(column: ColumnName, value: ResolveFilterValue<Schema, Row, ColumnName> extends never ? NonNullable<unknown> : ResolveFilterValue<Schema, Row, ColumnName> extends infer ResolvedFilterValue ? NonNullable<ResolvedFilterValue> : never): this;
  /**
   * Match only rows where `column` is not equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  neq<ColumnName extends string>(column: ColumnName, value: ResolveFilterValue<Schema, Row, ColumnName> extends never ? unknown : ResolveFilterValue<Schema, Row, ColumnName> extends infer ResolvedFilterValue ? ResolvedFilterValue : never): this;
  gt<ColumnName extends string & keyof Row>(column: ColumnName, value: Row[ColumnName]): this;
  gt(column: string, value: unknown): this;
  gte<ColumnName extends string & keyof Row>(column: ColumnName, value: Row[ColumnName]): this;
  gte(column: string, value: unknown): this;
  lt<ColumnName extends string & keyof Row>(column: ColumnName, value: Row[ColumnName]): this;
  lt(column: string, value: unknown): this;
  lte<ColumnName extends string & keyof Row>(column: ColumnName, value: Row[ColumnName]): this;
  lte(column: string, value: unknown): this;
  like<ColumnName extends string & keyof Row>(column: ColumnName, pattern: string): this;
  like(column: string, pattern: string): this;
  likeAllOf<ColumnName extends string & keyof Row>(column: ColumnName, patterns: readonly string[]): this;
  likeAllOf(column: string, patterns: readonly string[]): this;
  likeAnyOf<ColumnName extends string & keyof Row>(column: ColumnName, patterns: readonly string[]): this;
  likeAnyOf(column: string, patterns: readonly string[]): this;
  ilike<ColumnName extends string & keyof Row>(column: ColumnName, pattern: string): this;
  ilike(column: string, pattern: string): this;
  ilikeAllOf<ColumnName extends string & keyof Row>(column: ColumnName, patterns: readonly string[]): this;
  ilikeAllOf(column: string, patterns: readonly string[]): this;
  ilikeAnyOf<ColumnName extends string & keyof Row>(column: ColumnName, patterns: readonly string[]): this;
  ilikeAnyOf(column: string, patterns: readonly string[]): this;
  regexMatch<ColumnName extends string & keyof Row>(column: ColumnName, pattern: string): this;
  regexMatch(column: string, pattern: string): this;
  regexIMatch<ColumnName extends string & keyof Row>(column: ColumnName, pattern: string): this;
  regexIMatch(column: string, pattern: string): this;
  is<ColumnName extends string & keyof Row>(column: ColumnName, value: Row[ColumnName] & (boolean | null)): this;
  is(column: string, value: boolean | null): this;
  /**
   * Match only rows where `column` IS DISTINCT FROM `value`.
   *
   * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
   * are considered equal (not distinct), and comparing `NULL` with any non-NULL
   * value returns true (distinct).
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  isDistinct<ColumnName extends string>(column: ColumnName, value: ResolveFilterValue<Schema, Row, ColumnName> extends never ? unknown : ResolveFilterValue<Schema, Row, ColumnName> extends infer ResolvedFilterValue ? ResolvedFilterValue : never): this;
  /**
   * Match only rows where `column` is included in the `values` array.
   *
   * @param column - The column to filter on
   * @param values - The values array to filter with
   */
  in<ColumnName extends string>(column: ColumnName, values: ReadonlyArray<ResolveFilterValue<Schema, Row, ColumnName> extends never ? unknown : ResolveFilterValue<Schema, Row, ColumnName> extends infer ResolvedFilterValue ? ResolvedFilterValue : never>): this;
  /**
   * Match only rows where `column` is NOT included in the `values` array.
   *
   * @param column - The column to filter on
   * @param values - The values array to filter with
   */
  notIn<ColumnName extends string>(column: ColumnName, values: ReadonlyArray<ResolveFilterValue<Schema, Row, ColumnName> extends never ? unknown : ResolveFilterValue<Schema, Row, ColumnName> extends infer ResolvedFilterValue ? ResolvedFilterValue : never>): this;
  contains<ColumnName extends string & keyof Row>(column: ColumnName, value: string | ReadonlyArray<Row[ColumnName]> | Record<string, unknown>): this;
  contains(column: string, value: string | readonly unknown[] | Record<string, unknown>): this;
  containedBy<ColumnName extends string & keyof Row>(column: ColumnName, value: string | ReadonlyArray<Row[ColumnName]> | Record<string, unknown>): this;
  containedBy(column: string, value: string | readonly unknown[] | Record<string, unknown>): this;
  rangeGt<ColumnName extends string & keyof Row>(column: ColumnName, range: string): this;
  rangeGt(column: string, range: string): this;
  rangeGte<ColumnName extends string & keyof Row>(column: ColumnName, range: string): this;
  rangeGte(column: string, range: string): this;
  rangeLt<ColumnName extends string & keyof Row>(column: ColumnName, range: string): this;
  rangeLt(column: string, range: string): this;
  rangeLte<ColumnName extends string & keyof Row>(column: ColumnName, range: string): this;
  rangeLte(column: string, range: string): this;
  rangeAdjacent<ColumnName extends string & keyof Row>(column: ColumnName, range: string): this;
  rangeAdjacent(column: string, range: string): this;
  overlaps<ColumnName extends string & keyof Row>(column: ColumnName, value: string | ReadonlyArray<Row[ColumnName]>): this;
  overlaps(column: string, value: string | readonly unknown[]): this;
  textSearch<ColumnName extends string & keyof Row>(column: ColumnName, query: string, options?: {
    config?: string;
    type?: 'plain' | 'phrase' | 'websearch';
  }): this;
  textSearch(column: string, query: string, options?: {
    config?: string;
    type?: 'plain' | 'phrase' | 'websearch';
  }): this;
  match<ColumnName extends string & keyof Row>(query: Record<ColumnName, Row[ColumnName]>): this;
  match(query: Record<string, unknown>): this;
  not<ColumnName extends string & keyof Row>(column: ColumnName, operator: FilterOperator, value: Row[ColumnName]): this;
  not(column: string, operator: string, value: unknown): this;
  /**
   * Match only rows which satisfy at least one of the filters.
   *
   * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure it's properly sanitized.
   *
   * It's currently not possible to do an `.or()` filter across multiple tables.
   *
   * @param filters - The filters to use, following PostgREST syntax
   * @param options - Named parameters
   * @param options.referencedTable - Set this to filter on referenced tables
   * instead of the parent table
   * @param options.foreignTable - Deprecated, use `referencedTable` instead
   */
  or(filters: string, {
    foreignTable,
    referencedTable
  }?: {
    foreignTable?: string;
    referencedTable?: string;
  }): this;
  filter<ColumnName extends string & keyof Row>(column: ColumnName, operator: `${'' | 'not.'}${FilterOperator}`, value: unknown): this;
  filter(column: string, operator: string, value: unknown): this;
}
//#endregion
//#region src/PostgrestQueryBuilder.d.ts
declare class PostgrestQueryBuilder<ClientOptions extends ClientServerOptions, Schema extends GenericSchema, Relation$1 extends GenericTable | GenericView, RelationName = unknown, Relationships = (Relation$1 extends {
  Relationships: infer R;
} ? R : unknown)> {
  url: URL;
  headers: Headers;
  schema?: string;
  signal?: AbortSignal;
  fetch?: Fetch;
  urlLengthLimit: number;
  /**
   * Creates a query builder scoped to a Postgres table or view.
   *
   * @example
   * ```ts
   * import PostgrestQueryBuilder from '@supabase/postgrest-js'
   *
   * const query = new PostgrestQueryBuilder(
   *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
   *   { headers: { apikey: 'public-anon-key' } }
   * )
   * ```
   */
  constructor(url: URL, {
    headers,
    schema,
    fetch,
    urlLengthLimit
  }: {
    headers?: HeadersInit;
    schema?: string;
    fetch?: Fetch;
    urlLengthLimit?: number;
  });
  /**
   * Clone URL and headers to prevent shared state between operations.
   */
  private cloneRequestState;
  /**
   * Perform a SELECT query on the table or view.
   *
   * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
   *
   * @param options - Named parameters
   *
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   *
   * @param options.count - Count algorithm to use to count rows in the table or view.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @remarks
   * When using `count` with `.range()` or `.limit()`, the returned `count` is the total number of rows
   * that match your filters, not the number of rows in the current page. Use this to build pagination UI.
   */
  select<Query extends string = '*', ResultOne = GetResult<Schema, Relation$1['Row'], RelationName, Relationships, Query, ClientOptions>>(columns?: Query, options?: {
    head?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], ResultOne[], RelationName, Relationships, 'GET'>;
  insert<Row extends (Relation$1 extends {
    Insert: unknown;
  } ? Relation$1['Insert'] : never)>(values: Row, options?: {
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], null, RelationName, Relationships, 'POST'>;
  insert<Row extends (Relation$1 extends {
    Insert: unknown;
  } ? Relation$1['Insert'] : never)>(values: Row[], options?: {
    count?: 'exact' | 'planned' | 'estimated';
    defaultToNull?: boolean;
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], null, RelationName, Relationships, 'POST'>;
  upsert<Row extends (Relation$1 extends {
    Insert: unknown;
  } ? Relation$1['Insert'] : never)>(values: Row, options?: {
    onConflict?: string;
    ignoreDuplicates?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], null, RelationName, Relationships, 'POST'>;
  upsert<Row extends (Relation$1 extends {
    Insert: unknown;
  } ? Relation$1['Insert'] : never)>(values: Row[], options?: {
    onConflict?: string;
    ignoreDuplicates?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
    defaultToNull?: boolean;
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], null, RelationName, Relationships, 'POST'>;
  /**
   * Perform an UPDATE on the table or view.
   *
   * By default, updated rows are not returned. To return it, chain the call
   * with `.select()` after filters.
   *
   * @param values - The values to update with
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count updated rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  update<Row extends (Relation$1 extends {
    Update: unknown;
  } ? Relation$1['Update'] : never)>(values: Row, {
    count
  }?: {
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], null, RelationName, Relationships, 'PATCH'>;
  /**
   * Perform a DELETE on the table or view.
   *
   * By default, deleted rows are not returned. To return it, chain the call
   * with `.select()` after filters.
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count deleted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  delete({
    count
  }?: {
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, Relation$1['Row'], null, RelationName, Relationships, 'DELETE'>;
}
//#endregion
//#region src/types/common/rpc.d.ts
type IsMatchingArgs<FnArgs extends GenericFunction['Args'], PassedArgs extends GenericFunction['Args']> = [FnArgs] extends [Record<PropertyKey, never>] ? PassedArgs extends Record<PropertyKey, never> ? true : false : keyof PassedArgs extends keyof FnArgs ? PassedArgs extends FnArgs ? true : false : false;
type MatchingFunctionArgs<Fn$1 extends GenericFunction, Args extends GenericFunction['Args']> = Fn$1 extends {
  Args: infer A extends GenericFunction['Args'];
} ? IsMatchingArgs<A, Args> extends true ? Fn$1 : never : false;
type FindMatchingFunctionByArgs<FnUnion, Args extends GenericFunction['Args']> = FnUnion extends infer Fn extends GenericFunction ? MatchingFunctionArgs<Fn, Args> : false;
type TablesAndViews$1<Schema extends GenericSchema> = Schema['Tables'] & Exclude<Schema['Views'], ''>;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends (() => infer R) ? R : never;
type IsAny<T> = 0 extends 1 & T ? true : false;
type ExactMatch<T, S> = [T] extends [S] ? ([S] extends [T] ? true : false) : false;
type ExtractExactFunction<Fns, Args> = Fns extends infer F ? F extends GenericFunction ? ExactMatch<F['Args'], Args> extends true ? F : never : never : never;
type IsNever<T> = [T] extends [never] ? true : false;
type RpcFunctionNotFound<FnName> = {
  Row: any;
  Result: {
    error: true;
  } & "Couldn't infer function definition matching provided arguments";
  RelationName: FnName;
  Relationships: null;
};
type CrossSchemaError<TableRef extends string> = {
  error: true;
} & `Function returns SETOF from a different schema ('${TableRef}'). Use .overrideTypes<YourReturnType>() to specify the return type explicitly.`;
type GetRpcFunctionFilterBuilderByArgs<Schema extends GenericSchema, FnName extends string & keyof Schema['Functions'], Args> = {
  0: Schema['Functions'][FnName];
  1: IsAny<Schema> extends true ? any : IsNever<Args> extends true ? IsNever<ExtractExactFunction<Schema['Functions'][FnName], Args>> extends true ? LastOf<Schema['Functions'][FnName]> : ExtractExactFunction<Schema['Functions'][FnName], Args> : Args extends Record<PropertyKey, never> ? LastOf<Schema['Functions'][FnName]> : Args extends GenericFunction['Args'] ? IsNever<LastOf<FindMatchingFunctionByArgs<Schema['Functions'][FnName], Args>>> extends true ? LastOf<Schema['Functions'][FnName]> : LastOf<FindMatchingFunctionByArgs<Schema['Functions'][FnName], Args>> : ExtractExactFunction<Schema['Functions'][FnName], Args> extends GenericFunction ? ExtractExactFunction<Schema['Functions'][FnName], Args> : any;
}[1] extends infer Fn ? IsAny<Fn> extends true ? {
  Row: any;
  Result: any;
  RelationName: FnName;
  Relationships: null;
} : Fn extends GenericFunction ? {
  Row: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['to'] extends keyof TablesAndViews$1<Schema> ? TablesAndViews$1<Schema>[Fn['SetofOptions']['to']]['Row'] : Fn['Returns'] extends any[] ? Fn['Returns'][number] extends Record<string, unknown> ? Fn['Returns'][number] : CrossSchemaError<Fn['SetofOptions']['to'] & string> : Fn['Returns'] extends Record<string, unknown> ? Fn['Returns'] : CrossSchemaError<Fn['SetofOptions']['to'] & string> : Fn['Returns'] extends any[] ? Fn['Returns'][number] extends Record<string, unknown> ? Fn['Returns'][number] : never : Fn['Returns'] extends Record<string, unknown> ? Fn['Returns'] : never;
  Result: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['isSetofReturn'] extends true ? Fn['SetofOptions']['isOneToOne'] extends true ? Fn['Returns'][] : Fn['Returns'] : Fn['Returns'] : Fn['Returns'];
  RelationName: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['to'] : FnName;
  Relationships: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['to'] extends keyof Schema['Tables'] ? Schema['Tables'][Fn['SetofOptions']['to']]['Relationships'] : Fn['SetofOptions']['to'] extends keyof Schema['Views'] ? Schema['Views'][Fn['SetofOptions']['to']]['Relationships'] : null : null;
} : Fn extends false ? RpcFunctionNotFound<FnName> : RpcFunctionNotFound<FnName> : RpcFunctionNotFound<FnName>;
//#endregion
//#region src/PostgrestClient.d.ts
/**
 * PostgREST client.
 *
 * @typeParam Database - Types for the schema from the [type
 * generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
 *
 * @typeParam SchemaName - Postgres schema to switch to. Must be a string
 * literal, the same one passed to the constructor. If the schema is not
 * `"public"`, this must be supplied manually.
 */
declare class PostgrestClient<Database = any, ClientOptions extends ClientServerOptions = (Database extends {
  __InternalSupabase: infer I extends ClientServerOptions;
} ? I : {}), SchemaName extends string & keyof Omit<Database, '__InternalSupabase'> = ('public' extends keyof Omit<Database, '__InternalSupabase'> ? 'public' : string & keyof Omit<Database, '__InternalSupabase'>), Schema extends GenericSchema = (Omit<Database, '__InternalSupabase'>[SchemaName] extends GenericSchema ? Omit<Database, '__InternalSupabase'>[SchemaName] : any)> {
  url: string;
  headers: Headers;
  schemaName?: SchemaName;
  fetch?: Fetch;
  urlLengthLimit: number;
  /**
   * Creates a PostgREST client.
   *
   * @param url - URL of the PostgREST endpoint
   * @param options - Named parameters
   * @param options.headers - Custom headers
   * @param options.schema - Postgres schema to switch to
   * @param options.fetch - Custom fetch
   * @param options.timeout - Optional timeout in milliseconds for all requests. When set, requests will automatically abort after this duration to prevent indefinite hangs.
   * @param options.urlLengthLimit - Maximum URL length in characters before warnings/errors are triggered. Defaults to 8000.
   * @example
   * ```ts
   * import PostgrestClient from '@supabase/postgrest-js'
   *
   * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
   *   headers: { apikey: 'public-anon-key' },
   *   schema: 'public',
   *   timeout: 30000, // 30 second timeout
   * })
   * ```
   */
  constructor(url: string, {
    headers,
    schema,
    fetch,
    timeout,
    urlLengthLimit
  }?: {
    headers?: HeadersInit;
    schema?: SchemaName;
    fetch?: Fetch;
    timeout?: number;
    urlLengthLimit?: number;
  });
  from<TableName$1 extends string & keyof Schema['Tables'], Table extends Schema['Tables'][TableName$1]>(relation: TableName$1): PostgrestQueryBuilder<ClientOptions, Schema, Table, TableName$1>;
  from<ViewName extends string & keyof Schema['Views'], View extends Schema['Views'][ViewName]>(relation: ViewName): PostgrestQueryBuilder<ClientOptions, Schema, View, ViewName>;
  /**
   * Select a schema to query or perform an function (rpc) call.
   *
   * The schema needs to be on the list of exposed schemas inside Supabase.
   *
   * @param schema - The schema to query
   */
  schema<DynamicSchema extends string & keyof Omit<Database, '__InternalSupabase'>>(schema: DynamicSchema): PostgrestClient<Database, ClientOptions, DynamicSchema, Database[DynamicSchema] extends GenericSchema ? Database[DynamicSchema] : any>;
  /**
   * Perform a function call.
   *
   * @param fn - The function name to call
   * @param args - The arguments to pass to the function call
   * @param options - Named parameters
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   * @param options.get - When set to `true`, the function will be called with
   * read-only access mode.
   * @param options.count - Count algorithm to use to count rows returned by the
   * function. Only applicable for [set-returning
   * functions](https://www.postgresql.org/docs/current/functions-srf.html).
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @example
   * ```ts
   * // For cross-schema functions where type inference fails, use overrideTypes:
   * const { data } = await supabase
   *   .schema('schema_b')
   *   .rpc('function_a', {})
   *   .overrideTypes<{ id: string; user_id: string }[]>()
   * ```
   */
  rpc<FnName extends string & keyof Schema['Functions'], Args extends Schema['Functions'][FnName]['Args'] = never, FilterBuilder extends GetRpcFunctionFilterBuilderByArgs<Schema, FnName, Args> = GetRpcFunctionFilterBuilderByArgs<Schema, FnName, Args>>(fn: FnName, args?: Args, {
    head,
    get,
    count
  }?: {
    head?: boolean;
    get?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, FilterBuilder['Row'], FilterBuilder['Result'], FilterBuilder['RelationName'], FilterBuilder['Relationships'], 'RPC'>;
}
//#endregion
//#region src/index.d.ts
declare const _default: {
  PostgrestClient: typeof PostgrestClient;
  PostgrestQueryBuilder: typeof PostgrestQueryBuilder;
  PostgrestFilterBuilder: typeof PostgrestFilterBuilder;
  PostgrestTransformBuilder: typeof PostgrestTransformBuilder;
  PostgrestBuilder: typeof PostgrestBuilder;
  PostgrestError: typeof PostgrestError;
};
//#endregion
export { PostgrestBuilder, PostgrestClient, type ClientServerOptions as PostgrestClientOptions, PostgrestError, PostgrestFilterBuilder, type PostgrestMaybeSingleResponse, PostgrestQueryBuilder, type PostgrestResponse, type PostgrestResponseFailure, type PostgrestResponseSuccess, type PostgrestSingleResponse, PostgrestTransformBuilder, type GetResult as UnstableGetResult, _default as default };
//# sourceMappingURL=index.d.cts.map