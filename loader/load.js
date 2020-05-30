const axios = require('axios')
const companies = require('./rev2/companies.json')
const FormData = require('form-data');
const fs = require('fs');
const PORT = process.env.PORT

console.log(`PORT=${PORT}`);

const reviews = []

async function loadCompanies() {
  console.log('Loading Companies...');

  for(let company of companies) {
    let formData = new FormData()
    const file = await fs.createReadStream(`${__dirname}/rev2/logos/${company.companyId}.png`)
    formData.append('data', JSON.stringify(company))
    formData.append(
      'files.avatar',
      file,
      file.name
    )
    
    try {
      const res = await axios.post(`http://localhost:${PORT}/companies/load`, formData, {headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      }})
      console.log(res.data)
    } catch(err) {
      console.log(company.companyId, err.response ? err.response.status : err.message, err.response ? err.response.data : null)
    }
  }
}

async function loadReviews() {
  console.log('Loading Reviews...');
  
  await fs.readdir(`${__dirname}/rev2/reviews`, async (err, files) => {
    await files.forEach(async (file) => {
      if(!file.match(/json$/)) return 
      console.log(`Importing ${file}...`);
      const list = await require(`./rev2/reviews/${file}`)
      
      reviews.push(...list)
    });

    for(let index in reviews) {
      console.log('Waiting...');
      try {
        const res = await axios.post(`http://localhost:${PORT}/reviews/load`, reviews[index])
        console.log(res.data)
        console.log(`Loaded ${Number(index) + 1}/${reviews.length}`);
      } catch (err) {
        console.log(err.response ? err.response.status : err.message, err.response ? err.response.data : null)
        console.log(`Loaded ${Number(index) + 1}/${reviews.length}`);
      }
    }    
  })
}

(
  async function start() {
    await loadCompanies()
    await loadReviews()
  }
)()