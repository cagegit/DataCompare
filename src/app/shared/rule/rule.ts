export class Rule {
  constructor(
    public matchingId: number, // db_matching_id
    public matchingName: string, // db_match_name
    public sourceId: number, // db_id_1
    public targetId: number, // db_id_2
    public sourceName: string, // name_1
    public targetName: string, // name_2
    public startTime?: string, // starttime
    public endTime?: string, // endtime
    public finishCount?: number, // pro_count
    public count?: number, // t_matching_count
    public status?: number, // status
    public remark?: string // remark
  ) {}
}
export interface Db {
  db_id: number,
  name: string
}
export interface Schema {
  user_id?: number,
  user_name?: string,
  db_id?: number,
  id?: number,
  include?: number
}
export interface Table {
  db_id?: number,
  schema_id?: number,
  schema_name?: string
  table_id?: number,
  table_name?: string,
}
export interface RuleS {
  schema1: string,
  schema2: string,
  table1: string,
  table2: string
}
export interface Column {
  column_name?: string,
  data_length?: number,
  data_type?: string,
  position?: number,
  t_id?: number
}
export const DccpTip = {
    title: 'Dccp 提示'
};
