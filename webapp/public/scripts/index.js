const indexMail = () => {
  if (mailIndex === 0) {
    document.getElementById("mailToSort").innerHTML = '<p>Please wait while your mailbox is checked.</p>'
  }
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
  <button onclick='bucketMail("o", "${j.fromAddress}", ${j.uid})'>Screen out</button>
  <button onclick='bucketMail("c", "${j.fromAddress}", ${j.uid})'>Conversations</button>
  <button onclick='bucketMail("f", "${j.fromAddress}", ${j.uid})'>Feed</button>
  <button onclick='bucketMail("p", "${j.fromAddress}", ${j.uid})'>Paper trail</button>
  <button onclick='bucketMail("i", "${j.fromAddress}", ${j.uid})'>Ignore</button>
</div>`;
          mailIndex = 1;
          sortedMailCount += j.sortedMails;
          sortedMailTypes.o += j.sortedMailTypes.o
          sortedMailTypes.c += j.sortedMailTypes.c
          sortedMailTypes.f += j.sortedMailTypes.f
          sortedMailTypes.p += j.sortedMailTypes.p
          sortedMailTypes.i += j.sortedMailTypes.i
        } else if (j.result === "nomail") {
          sortedMailCount += j.sortedMails;
          sortedMailTypes.o += j.sortedMailTypes.o
          sortedMailTypes.c += j.sortedMailTypes.c
          sortedMailTypes.f += j.sortedMailTypes.f
          sortedMailTypes.p += j.sortedMailTypes.p
          sortedMailTypes.i += j.sortedMailTypes.i
          document.getElementById("mailToSort").innerHTML = `<p>All mail has been organized for this session.<p>
<p><strong>Number of mails sorted in this session: </strong>${sortedMailCount}</p>
<p><strong>How the mail was sorted</strong></p>
<p><strong>Conversations: </strong>${sortedMailTypes.c}</p>
<p><strong>Feed: </strong>${sortedMailTypes.f}</p>
<p><strong>Paper Trail: </strong>${sortedMailTypes.p}</p>
<p><strong>Screened Out: </strong>${sortedMailTypes.o}</p>
<p><strong>Last checked at: </strong>${Date()}</p>
<div>
  <button onclick='indexMail()'>Check for new mail</button>
</div>`;
          mailIndex = 0;
          sortedMailCount = 0;
          sortedMailTypes = {
            o: 0,
            f: 0,
            p: 0,
            c: 0,
            i: 0
          }
        }
      });
    })
    .catch((err) => {
      console.log(err);
    })
}
const bucketMail = (bucket, fromAddress, uid) => {
  data = {
    fromAddress: fromAddress,
    bucket: bucket,
    uid: uid
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
      res.json().then((j) => {
        if (j.result === "ok") {
          console.log('Mail bucketed correctly');
          sortedMailCount += 1;
          sortedMailTypes[bucket] += 1;
          indexMail();
        }
      });
    })
}

var mailIndex = 0;
var sortedMailCount = 0;
var sortedMailTypes = {
  o: 0,
  f: 0,
  p: 0,
  c: 0,
  i: 0
}
console.log("testing");
indexMail();