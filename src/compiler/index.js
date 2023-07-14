export const compileToFunction = (template) => {
  const ast = parse(template.trim())
  console.log(ast)

  const code = generate(ast)
  console.log(code)
  const render = new Function(`with(this){return ${code}}`)
  console.log(render)

  return { ast, render }
}

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = '[a-zA-Z_][\\-\\.0-9_a-zA-Z]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function createASTElement(tag, attrs, parent) {
  return {
    tag, // 标签名
    type: 1, // 元素
    children: [], // 儿子
    parent, // 父亲
    attrs // 属性
  }
}

function parse(template) {
  const stack = []
  let root = null

  // 开始标签
  function start(tagName, attrs) {
    const parent = stack[stack.length - 1]
    const element = createASTElement(tagName, attrs, parent)

    if (root === null) {
      root = element
    }

    if (parent) {
      element.parent = parent
      parent.children.push(element)
    }

    stack.push(element)
  }

  // 结束标签
  function end(tagName) {
    const endTag = stack.pop()
    if (endTag.tag !== tagName) {
      console.error('标签有误')
    }
  }

  // 文本标签
  function text(chars) {
    const parent = stack[stack.length - 1]
    chars = chars.replace(/\n\s+/g, '')
    if (chars) {
      parent.children.push({
        type: 2,
        text: chars
      })
    }
  }

  function parserStartTag() {
    const start = template.match(startTagOpen)
    if (start) {
      // 开始标签
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length)

      // 属性解析
      let end, attr
      while (!(end = template.match(startTagClose)) && (attr = template.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
      }
      if (end) {
        advance(end[0].length)
      }

      return match
    }
  }

  function advance(len) {
    template = template.substring(len)
  }

  while (template) {
    const index = template.indexOf('<')
    if (index === 0) {
      // 开始标签
      const startTagMatch = parserStartTag()
      if (startTagMatch) {
        // 推入栈中
        start(startTagMatch.tagName, startTagMatch.attrs)
      }

      // 结束标签
      const endTagMatch = template.match(endTag)
      if (endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
      }
    } else {
      // 文本内容
      const chars = template.substring(0, index)
      text(chars)
      advance(chars.length)
    }
  }

  // 生成 ast 语法树
  return root
}

function generate(ast) {
  // 生成属性
  function genProps() {
    const str = ast.attrs.map(({ name, value }) => {
      return `${name}:${JSON.stringify(value)}`
    }).join(',')
    return `{${str}}`
  }

  // 生成子节点
  function genChildren(children) {
    return children.map(child => gen(child)).join(',')
  }
  function gen(node) {
    if (node.type === 1) {
      return generate(node)
    } else {
      const text = node.text

      // 没有变量
      if (!defaultTagRE.test(text)) {
        return `_v(${JSON.stringify(text)})`
      }

      // 存在变量
      let lastIndex = defaultTagRE.lastIndex = 0
      const tokens = []
      let match = defaultTagRE.exec(text)
      while (match) {
        const index = match.index
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length

        // 继续匹配
        match = defaultTagRE.exec(text)
      }

      // 最后一段
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }

  const code = `_c('${ast.tag}', ${ast.attrs.length ? genProps(ast.attrs) : 'undefined'}${ast.children ? `, ${genChildren(ast.children)}` : ''})`

  return code
}
