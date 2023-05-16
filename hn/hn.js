import axios from 'axios'
import dayjs from 'dayjs'
import { writeFileSync } from 'fs'
import { argv } from 'process'

async function fetchHN(startTime, endTime, top) {
  try {
    const res = await axios.get(
      `http://hn.algolia.com/api/v1/search?numericFilters=created_at_i>${startTime},created_at_i<${endTime}`
    )
    const topNews = res.data.hits.slice(0, top)

    const contents = topNews.map((item) => {
      let { created_at, title, url, author, points, num_comments, objectID } =
        item
      if (!url) url = `https://news.ycombinator.com/item?id=${objectID}`
      return { created_at, title, url, author, points, num_comments, objectID }
    })

    return contents
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function getWeeklyNews() {
  console.log(' Start fetching weekly news')

  const endTime = dayjs().startOf('w').unix()
  const startTime = endTime - (7 * 24 * 60 * 60 + 12 * 60 * 60)

  const top = 10
  const contents = await fetchHN(startTime, endTime, top)

  const fileName = `./hn/weekly/${dayjs
    .unix(endTime)
    .format('YYYY-MM-DD')}.json`
  writeFileSync(fileName, JSON.stringify(contents))

  console.log(`Save ${fileName} done`)
}

async function getMonthlyNews() {
  console.log(' Start fetching monthly news')

  const endTime = dayjs().startOf('M').unix()
  const startTime = endTime - (30 * 24 * 60 * 60 + 12 * 60 * 60)
  const top = 20
  const contents = await fetchHN(startTime, endTime, top)

  const fileName = `./hn/monthly/${dayjs
    .unix(endTime)
    .format('YYYY-MM-DD')}.json`
  writeFileSync(fileName, JSON.stringify(contents))

  console.log(`Save ${fileName} done`)
}

const type = argv[2] ? argv[2] : 'weekly'

if (type == 'weekly') {
  await getWeeklyNews()
} else if (type == 'monthly') {
  await getMonthlyNews()
}
