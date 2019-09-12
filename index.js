const express = require("express");
const fs = require("fs");
const http = require("https");
const app = express();

app.use(express.json());

app.post("/", async (req, res) => {
  res.send(await attachment(req));
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
const attachment = async event => {
  let { files, authorization, company, issue } = event.body;
  await files.forEach(async element => {
    let file = `/tmp/${element.Name}`;
    fs.writeFile(file, element.ContentBytes, err => {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved! :)");
      sendAttachment(company, issue, authorization, element.ContentType, file);
    });
  });
};
/**
 * 
 * @param {*} status 
 * @param {*} body 
 */
const sendRes = (status, body) => {
  var response = {
    statusCode: status,

    headers: {
      "Content-Type": "application/json"
    },

    body: body
  };

  return response;
};
/**
 * 
 * @param {*} company 
 * @param {*} issue 
 * @param {*} authorization 
 * @param {*} contentType 
 * @param {*} file 
 */
const sendAttachment = (company, issue, authorization, contentType, file) => {
  var options = {
    method: "POST",
    hostname: `${company}.atlassian.net`,
    path: `/rest/api/3/issue/${issue}/attachments`,
    headers: {
      "content-type":
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
      "X-Atlassian-Token": "no-check",
      Authorization: authorization,
      "cache-control": "no-cache"
    }
  };
  console.log(company, issue, authorization, contentType, file);
  let req = http.request(options, res => {
    let chunks = [];
    res.on("data", chunk => {
      chunks.push(chunk);
    });
    res.on("end", () => {
      let body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });
  req.write(
    `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="file"; filename="${file}"\r\nContent-Type: ${contentType}\r\n\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--`
  );
  req.end();
};
