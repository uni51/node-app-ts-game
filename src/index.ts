type Mode = 'normal' | 'hard' // ユニオン型

const printLine = (text: string, breakLine: boolean = true) => {
  process.stdout.write(text + ( breakLine ? '\n' : ''))
}

const readline = async() => {
  const input: string = await new Promise((resolve) => process.stdin.once('data', (data) => resolve(data.toString())))
  return input.trim()
}

const promptInput = async (text: string) => {
  printLine(`\n${text}\n> `, false)
  return readline()
}

const promptSelect = async <T>(text:string, values: readonly T[]): Promise<T> => {
  printLine(`\n${text}`)
  values.forEach((value) => {
    printLine(`- ${value}`)
  })
  printLine('> ', false)

  const input = await readline()
  if (values.includes(input)) {
    return input
  } else {
    return promptSelect<T>(text, values)
  }
}

class HitAndBlow {
  private readonly answerSource = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  private answer: string[] = []
  private tryCount = 0
  private mode: Mode = 'normal'

  async setting() {
    this.mode = await promptSelect<Mode>('モードを入力してください。', ['normal', 'hard'])
    const answerLength = this.getAnswerLength()

    while(this.answer.length < answerLength) {
      const randNum = Math.floor(Math.random() * this.answerSource.length)
      const selectedItem = this.answerSource[randNum]
      if(!this.answer.includes(selectedItem)) {
        this.answer.push(selectedItem)
      }
    }
  }

  async play() {
    const answerLength = this.getAnswerLength()
    const inputArr = (await promptInput(`「,」区切りで${answerLength}つの文字を入力してください`)).split(',')

    if (!this.validate(inputArr)) {
      printLine('無効な入力です。')
      await this.play()
      return
    }

    const result = this.check(inputArr)

    if (result.hit !== this.answer.length) {
      // 不正解だったら続ける
      printLine(`---\nHit: ${result.hit}\nBlow: ${result.blow}\n---`)
      this.tryCount += 1
      await this.play()
    } else {
      // 正解だったら終了
      this.tryCount += 1
    }
  }

  private check(input: string[]) {
    let hitCount = 0
    let blowCount = 0

    input.forEach((val, index) => {
      if (val === this.answer[index]) {
        hitCount += 1
      } else if (this.answer.includes(val)) {
        blowCount += 1
      }
    })

    return {
      hit: hitCount,
      blow: blowCount
    }
  }

  end() {
    printLine(`正解です!\n試行回数：${this.tryCount}回`)
    process.exit()
  }

  private validate(inputArr: string[]) {
    // 受け取る文字列の数が、「answer.length」個である。
    const isLengthValid = inputArr.length === this.answer.length
    // それぞれの文字列が、「answerSource」に含まれるいずれかの文字列である。
    const isAllAnswerSourceOption = inputArr.every((val) => this.answerSource.includes(val))
    // それぞれの文字列に重複がない
    const isAllDifferentValues = inputArr.every((val, i) => inputArr.indexOf(val) === i)
    return isLengthValid && isAllAnswerSourceOption && isAllDifferentValues
  }

  private getAnswerLength() {
    switch (this.mode) {
      case 'normal':
        return 3
      case 'hard':
        return 4
      default:
        const neverValue: never = this.mode
        throw new Error(`${neverValue}は無効なモードです。`)
    }
  }
}

;(async () => {
  const hitAndBlow = new HitAndBlow()
  await hitAndBlow.setting()
  await hitAndBlow.play()
  hitAndBlow.end()
})()
