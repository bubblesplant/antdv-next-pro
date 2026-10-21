# valueType 解析协议

- `ProValueTypeDefinitionValue` 为 `{ type: ProValueType; [key: string]: unknown }`，其余属性作为该字段的格式化/控件配置。
- `ProColumnValueType<T>` 为字符串、上述对象、或 `(record: T, index: number) => 字符串 | 对象`。
- `resolveColumnValueType(valueType, record, index)`（`src/table/valueType.ts`）统一返回 `{ type, ...配置 }`，缺省为 text。
- ProField 接受字符串/对象；其内部将对象的 type 用作类型，其余配置与 fieldProps 合并，显式 fieldProps 优先。
- Table 在渲染、编辑和搜索适配边界解析；render/renderText/formItemRender 继续收到原始 schema，不能丢 record/index 上下文。
- 表单解析函数型列时，record 为当前完整值、index 为该列索引；解析结果的配置先合入 fieldProps，再以显式 fieldProps 覆盖。
