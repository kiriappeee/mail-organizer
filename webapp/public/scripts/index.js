var mailIndex = 0;
console.log("testing");
let options = {
  method: "POST",
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  body: JSON.stringify({ mailIndex: mailIndex })
}
fetch('mailToIndex', options)
  .then((res) => {
    res.json().then((j) => {
      console.log(j);
      if (j.result === "ok") {
        document.getElementById("mailToSort").innerHTML = `<p><strong>Subject: </strong> ${j.subject}<p>
<p><strong>From: </strong> ${j.fromAddress}</p>
<div>
  <button onclick='bucketMail("out", "${j.fromAddress}")'>Screen out</button>
  <button onclick='bucketMail("conversation", "${j.fromAddress}")'>Conversations</button>
  <button onclick='bucketMail("feed", "${j.fromAddress}")'>Feed</button>
  <button onclick='bucketMail("papertrail", "${j.fromAddress}")'>Paper trail</button>
  <button onclick='bucketMail("ignore", "${j.fromAddress}")'>Ignore</button>`;
      }
      mailIndex = 1;
    });
  })
  .catch((err) => {
    console.log(err);
  })
const indexMail = () => {
  console.log("testing func");
  let options = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ mailIndex: mailIndex })
  }
  fetch('mailToIndex', options)
    .then((res) => {
      res.json().then((j) => {
        console.log(j);
        if (j.result === "ok") {
          document.getElementById("mailToSort").innerHTML = `<p><strong>Subject: </strong> ${j.subject}<p>
<p><strong>From: </strong> ${j.fromAddress}</p>
<div>
  <button onclick='bucketMail("out", "${j.fromAddress}")'>Screen out</button>
  <button onclick='bucketMail("conversation", "${j.fromAddress}")'>Conversations</button>
  <button onclick='bucketMail("feed", "${j.fromAddress}")'>Feed</button>
  <button onclick='bucketMail("papertrail", "${j.fromAddress}")'>Paper trail</button>
  <button onclick='bucketMail("ignore", "${j.fromAddress}")'>Ignore</button>`;
        }
        mailIndex = 1;
      });
    })
    .catch((err) => {
      console.log(err);
    })
}
const bucketMail = (bucket, fromAddress) => {
  data = {
    fromAddress: fromAddress,
    bucket: bucket
  }
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
  fetch('bucketMail', options)
    .then((res) => {
      console.log('Bucketed')
    })
}
