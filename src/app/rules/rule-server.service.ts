import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/http.service';
import { Rule } from '../shared/rule/rule';
import { URLSearchParams, QueryEncoder} from '@angular/http';

export class TsEncoder extends  QueryEncoder {
  encodeKey(k: string): string {
    k = super.encodeKey(k);
    return k.replace(/\+/gi, '%2B');
  }
  encodeValue(v: string): string {
    v = super.encodeValue(v);
    return v.replace(/\+/gi, '%2B');
  }
}

@Injectable()
export class RuleServerService {
  private baseUrl= '../db/dbsource/';
  constructor(private httpService: HttpService) { }
  // 获取所有已配置规则
  getAllRules() {
    const url = this.baseUrl + 'matching/get';
    return this.httpService.post(url, {}).map(res => {
      const result = [];
      for (const v of res.data){
         result.push(new Rule(v.db_matching_id, v.db_match_name, v.db_id_1, v.db_id_2, v.name_1, v.name_2, v.starttime, v.endtime, v.pro_count, v.t_matching_count, v.status, v.remark));
      }
      res.list = result;
      return res;
    });
  }
  /*
  *  根据匹配id删除规则
  * */
  deleteRule(match_id: number| string) {
    const url = this.baseUrl + 'matching/delete';
    return this.httpService.post(url, `db_matching_id=${match_id}`);
  }
  /*
  * 根据匹配id查询对应的规则信息
  * */
  getRuleByMatchId(match_id: number| string) {
    const url = this.baseUrl + 'matching/getOneDbMatch';
    return this.httpService.post(url, `db_matching_id=${match_id}`).map(res => {
      const v = res.data;
      res.rule = new Rule(v.db_matching_id, v.db_match_name, v.db_id_1, v.db_id_2, v.name_1, v.name_2, '', '', v.pro_count, v.t_matching_count, v.status, v.remark);
      return res;
    });
  }
  /*
  * 保存数据库对应关系信息
  * */
  saveMatchDbInfo(dbInfo: {flag: string, remark: string, sourceDb: {id: number, flag: string}, targetDb: {id: number, flag: string}}) {
    const url = this.baseUrl + 'matching/set';
    // const parmas = {db_id_1: dbInfo.sourceDb.id, db_id_2: dbInfo.targetDb.id, db_match_name: dbInfo.flag, remark: dbInfo.remark};
    const params = `db_id_1=${dbInfo.sourceDb.id}&db_id_2=${dbInfo.targetDb.id}&db_match_name=${dbInfo.flag}&remark=${dbInfo.remark}`;
    return this.httpService.post(url, params);
  }
  /*
  * 修改数据库对应关系信息
  * */
  editDbMatchInfo(db_matching_id: number, flag: string, remark: string) {
    const url = this.baseUrl + 'matching/edit';
    const params = `db_matching_id=${db_matching_id}&db_match_name=${flag}&remark=${remark}`;
    return this.httpService.post(url, params);
  }
  /*
  * 获取数据库下面的所有schemas
  * */
  getSchemasByDbId(db_id: number| string) {
    const url = this.baseUrl + 'schema/get';
    return this.httpService.post(url, `db_id=${db_id}`);
  }
  /*
  * 获取schema下面所有的表
  * */
  getUnmatchTables(match_id: number, db_id: number, schema_id: number, table_type: number) {
    const url = this.baseUrl + 'schema/getSchemaTableList';
    // {db_matching_id: match_id, db_id: db_id, schema_user_id: schema_id, table_type: table_type}
    const params = `db_matching_id=${match_id}&db_id=${db_id}&schema_user_id=${schema_id}&tableType=${table_type}`;
    return this.httpService.post(url, params);
  }
  /*
  * 获取所有已配置表
  * */
  getMatchTables(match_id: number, source_schema = '', target_schema = '', source_table = '', target_table = '') {
    const url = '../table/t_matching/get';
    // {db_matching_id: match_id, schema_like_1: source_schema, schema_like_2: target_schema, table_like_1: source_table, table_like_2: target_table}
    const params = `db_matching_id=${match_id}&schema_like_1=${source_schema}&schema_like_2=${target_schema}&table_like_1=${source_table}&table_like_2=${target_table}`;
    return this.httpService.post(url, params)
      .map(res => {
        const result = [];
        for (const v of res.data) {
          const tables = [];
          for (const t of  v.tableList) {
            tables.push({t_matching_id: t.t_matching_id, source_table_id: t.t_id_1, source_table_name: t.t_name_1, target_table_id:  t.t_id_2,
              target_table_name: t.t_name_2, checked: false});
          }
          const schema = {db_matching_id: v.db_matching_id, sourceSchemaId: v.schema_id_1, targetSchemaId: v.schema_id_2,
            sName: v.schema_name_1, tName: v.schema_name_2, isShow: true, checked: false, tables: tables};
          result.push(schema);
        }
        res.list = result;
        return res;
      });
  }
  /*
  * 保存表匹配关系
  * */
  saveTableMatch(match_id: number, s_schema_id: number, t_schema_id: number, matchArray: Array<Object>) {
     const url = '../table/t_matching/saveTableMatch';
     const strArray = JSON.stringify(matchArray);
     // {db_matching_id: match_id, schema_user_1: s_schema_id, schema_user_2: t_schema_id, tNameMatchArray: strArray}
     const params = `db_matching_id=${match_id}&schema_user_id_1=${s_schema_id}&schema_user_id_2=${t_schema_id}&tNameMatchArray=${strArray}`;
     return this.httpService.post(url, params);
  }
  /*
  * 删除表匹配关系
  * */
  deleteTableMatch(match_id: number, tableMatchIdArray: Array<number| string>) {
    const url = '../table/t_matching/delete';
    const strArray = JSON.stringify(tableMatchIdArray);
    // {db_matching_id: match_id, tableMatchIdArray: strArray}
    const params = `db_matching_id=${match_id}&tableMatchIdArray=${strArray}`;
    return this.httpService.post(url, params);
  }
  /*
  * 获取自动匹配列表
  * */
  getAutoTableMatchList(match_id: number, s_schema_id: number, t_schema_id: number) {
    const url = '../table/t_matching/getAutoTableMatchList';
    // {db_matching_id: match_id, schema_user_id_1: s_schema_id, schema_user_id_2: t_schema_id}
    const params = `db_matching_id=${match_id}&schema_user_id_1=${s_schema_id}&schema_user_id_2=${t_schema_id}`;
    return this.httpService.post(url, params)
      .map(res => {
          res.list = [];
          res.data.forEach(v => {
            res.list.push({checked: false, sSchemaId: v.schema_user_id_1, tSchemaId: v.schema_user_id_2, sTname: v.table_name_1, tTname: v.table_name_2});
          });
          return res;
      });
  }
  /*
  * 获取未匹配列表
  * */
  getUnmatchColumnList(d_match_id: number, t_match_id: number, type: number| string) {
    const url = '../column/unmatch/getUnmatchColumnList';
    // {db_matching_id: d_match_id, t_matching_id: t_match_id, column_type: type}
    const params = `db_matching_id=${d_match_id}&t_matching_id=${t_match_id}&columnType=${type}`;
    return this.httpService.post(url, params);
  }
  /*
  * 获取已配置列表
  * */
  getMatchColumnList(t_match_id: number, s_column = '', t_column = '') {
    const url = '../column/c_matching/get';
    // {t_matching_id: t_match_id, column_like_1: s_column, column_like_2: t_column}
    const params = `t_matching_id=${t_match_id}&column_like_1=${s_column}&column_like_2=${t_column}`;
    return this.httpService.post(url, params).map(res => {
       res.checked = false;
       return res;
    });
  }
  /*
  * 保存column的对应关系
  * */
  saveColumnMatch(t_match_id: number, columnNameMatchArray: Array<Object>) {
    const url = '../column/c_matching/set';
    const strArr = JSON.stringify(columnNameMatchArray);
    // {t_matching_id: t_match_id, columnNameMatchArray: strArr}
    const params = `t_matching_id=${t_match_id}&columnNameMatchArray=${strArr}`;
    return this.httpService.post(url, params);
  }
  /*
  * 删除一条或者多条column的对应关系
  * */
  deleteColumnMatch(t_match_id: number, matchingIdArray: Array<Object>) {
    const url = '../column/c_matching/delete';
    const strArr = JSON.stringify(matchingIdArray);
    // {t_matching_id: t_match_id, cMatchingIdArray: strArr}
    const params = `t_matching_id=${t_match_id}&cMatchingIdArray=${strArr}`;
    return this.httpService.post(url, params);
  }
  /*
  * 获取column自动匹配列表
  * */
  getAutoColumnMatchList(t_match_id: number) {
    const url = '../column/c_matching/getAutoColumnMatchList';
    return this.httpService.post(url, `t_matching_id=${t_match_id}`) .map(res => {
      res.list = [];
      res.data.forEach(v => {
        res.list.push({checked: false, t_matching_id: v.t_matching_id, column_name_1: v.column_name_1, column_name_2: v.column_name_2});
      });
      return res;
    });
  }
  /*
  * 获取策略信息
  * */
  getStrategys(t_match_id: number | string) {
    const url = '../table/t_matching/ploy/get';
    const params = `t_matching_id=${t_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
  * 保存过滤条件
  * */
  saveCondition(t_match_id_array: Array<number| string>, sourceFilter: string, targetFilter: string) {
    const url = '../table/t_matching/where/set';
    const strArr = JSON.stringify(t_match_id_array);
    const params = `tMatchingIdArray=${strArr}&where_str1=${sourceFilter}&where_str2=${targetFilter}`;
    return this.httpService.post(url, params);
  }
  /*
  * 保存快速比对策略
  * */
  saveFastMatch(t_match_id_array: Array<number| string>, str1: string, str2: string) {
    const url = '../table/t_matching/fast/set';
    const strArr = JSON.stringify(t_match_id_array);
    const params = `tMatchingIdArray=${strArr}&fast_str1=${str1}&fast_str2=${str2}`;
    return this.httpService.post(url, params);
  }
  /*
  * 超出长度字段 进行md5 匹配
  * */
  saveMd5Condition(t_match_id_array: Array<number| string>, md5Len: number |string) {
    const url = '../table/t_matching/md5/set';
    const strArr = JSON.stringify(t_match_id_array);
    const params = `tMatchingIdArray=${strArr}&md5_length=${md5Len}`;
    return this.httpService.post(url, params);
  }
  /*
  * 过滤超出长度的字段
  * */
  saveMaxDataLength(t_match_id_array: Array<number| string>, maxLen: number |string) {
    const url = '../table/t_matching/max_data_length/set';
    const strArr = JSON.stringify(t_match_id_array);
    const params = `tMatchingIdArray=${strArr}&max_data_length=${maxLen}`;
    return this.httpService.post(url, params);
  }
  /*
  * 开始比对
  * */
  startToMatch(d_match_id: number | string) {
    const url = '../compare/db/start';
    const params = `db_matching_id=${d_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
   * 重新比对
   * */
  restartToMatch(d_match_id: number | string) {
    const url = '../compare/db/restart';
    const params = `db_matching_id=${d_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
   * 停止比对
   * */
  stopToMatch(d_match_id: number | string) {
    const url = '../compare/db/suspend';
    const params = `db_matching_id=${d_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
   * 停止单个表比对
   * */
  stopTableMatch(d_match_id: number | string, t_match_id: number | string) {
    const url = '../compare/table/suspend';
    const params = `db_matching_id=${d_match_id}&t_matching_id=${t_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
   * 启动单个表比对
   * */
  startTableMatch(d_match_id: number | string, t_match_id: number | string) {
    const url = '../compare/table/continue';
    const params = `db_matching_id=${d_match_id}&t_matching_id=${t_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
   * 查看单个表的比对结果
   * */
  getMatchList(d_match_id: number | string) {
    const url = '../table/t_matching/getMatchResult';
    const params = `db_matching_id=${d_match_id}`;
    return this.httpService.post(url, params);
  }
  /*
   * 查看单个表的比对详情
   * */
  getMatchDetail(d_match_id: number | string, table_id: number | string, pageindex = 1, pagesize = 10) {
    const url = '../compare/table/getDetailResult';
    const params = `db_matching_id=${d_match_id}&table_id=${table_id}&pageindex=${pageindex}&pagesize=${pagesize}`;
    return this.httpService.post(url, params).map(res => {
       if (res.success && res.data) {
          res.data.resultList.forEach(v => v.checked = false);
       }
       return res;
    });
  }
  /*
   * 同步到另外一端
   * */
  asyncToOther(t_match_id: number | string, table_type = 1, rowIdArray: Array<string | number>) {
    const url = '../repair/insert2other';
    const strArr = JSON.stringify(rowIdArray);
    // const data = new URLSearchParams('', new TsEncoder());
    // data.append('t_matching_id', t_match_id + '');
    // data.append('tableType', table_type + '');
    // data.append('rowIdArrayStr', strArr);
    const params = `t_matching_id=${t_match_id}&tableType=${table_type}&rowIdArrayStr=${strArr}`;
    const newP = new URLSearchParams(params, new TsEncoder());
    return this.httpService.post(url, newP);
  }
  /*
   * 删除数据
   * */
  delteMatchData(t_match_id: number | string, table_type = 2, rowIdArray: string[]) {
    const url = '../repair/delete';
    const strArr = JSON.stringify(rowIdArray);
    // const data = new URLSearchParams('', new TsEncoder());
    // data.append('t_matching_id', t_match_id + '');
    // data.append('tableType', table_type + '');
    // data.append('rowIdArrayStr', strArr);
    const params = `t_matching_id=${t_match_id}&tableType=${table_type}&rowIdArrayStr=${strArr}`;
    const newP = new URLSearchParams(params, new TsEncoder());
    // console.log(params);
    return this.httpService.post(url, newP);
  }
  /*
   * 获取同步进度
   * */
  getAsyncProcess() {
    const url = '../repair/status?' + Math.random();
    return this.httpService.post(url, '');
  }
  /*
  *  获取快速比对详情
  * */
  getFastMatchResult(t_match_id: string | number) {
    const url = '../compare/table/getFastDetailResult';
    return this.httpService.post(url, 't_matching_id=' + t_match_id);
  }
}
