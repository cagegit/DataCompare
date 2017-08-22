import { Injectable } from '@angular/core';
import { Rule, Table } from '../shared/rule/rule';
/*
* 共享数据 当前rule, table
* */

@Injectable()
export class RuleNowService {
  currentRule: Rule;
  currentTable: Table;
  constructor() { }

}
