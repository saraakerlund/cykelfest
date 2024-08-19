import React, { useState } from 'react'; // Import useState from react package
import logo from './logo.svg';
import './App.css';
import './style/style.scss';

function App() {

  const [fileContent, setFileContent] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [tables, setTables] = useState(null);
  let tries = 0;

  const handleFileUpload = (event) => {
    tries = 0;
    const table = fileContent.split('\n').map(row => row.split(';'));
    const headers = table[0];
    const data = table.slice(1);
    const jsonData = data.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    console.log(jsonData);
    setJsonData(jsonData);
  };

  const updateFile = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      setFileContent(fileContent);
    };
    reader.readAsText(file, 'utf-8');
  };

  const calculate = () => {
    if (tries < 5000) {
      try {
        jsonData.forEach(data => {
          data.Served = "";
          data.Not = data.AlreadyMeet.split(',').filter(value => value !== "");
        });

        const starter = calculateMain(1);
        const main = calculateMain(2);
        const dessert = calculateMain(3);

        setTables({ starter, main, dessert });

      } catch (error) {
        //console.error(error);
        tries = tries + 1;
        console.log(tries);
        calculate();

      }
    }
    else {
      console.log('No solution found');
    }
  }


  const calculateStarter = () => {
    const randomizedData = [...jsonData]; // Create a copy of jsonData
    randomizedData.sort(() => Math.random() - 0.5); // Randomize the order
    const groups = [];
    let groupSize = randomizedData.length % 3 === 0 ? 3 : 4;
    for (let i = 0; i < randomizedData.length; i += groupSize) {

      if (groupSize === 4 && (randomizedData.length + groups.length - 1) % 3 === 0) {
        groupSize = 3;
      }
      const group = randomizedData.slice(i, i + groupSize);

      const personServing = group[Math.floor(Math.random() * group.length)];
      group.ServedAt = personServing.ID;
      personServing.Served = 1;


      group.forEach((person) => {
        person.Not = group.map(p => p.ID)

        const alreadyMet = person.AlreadyMeet.split(',');
        person.Not = alreadyMet.filter(value => value !== "");
      });

      groups.push(group);
    }

    return groups;
    // Perform your calculations on the randomizedData
  };

  const calculateMain = (servingNumber) => {
    let randomizedData = [...jsonData]; // Create a copy of jsonData
    randomizedData.sort(() => Math.random() - 0.5); // Randomize the order
    const groups = [];
    const originalLength = randomizedData.length
    let groupSelection = randomizedData
    let group = [];

    let groupSize = randomizedData.length % 3 === 0 ? 3 : 4;

    for (let i = 0; i < originalLength; i++) {
      if (groupSelection.length === 0) {
        throw new Error('No more people to select from');
      }
      let person = undefined;

      if (servingNumber === 1) {
        person = groupSelection[0];
      }
      else {
        if (group.length === 0) {
          person = groupSelection.find(p => p.Served === "");
        }
        else {
          if (servingNumber === 2 && group.length === 1) {
            person = groupSelection.find(p => p.Served === "");
          }
          else {
            person = groupSelection.find(p => p.Served !== "");
          }
          if (person === undefined) {
            person = groupSelection[0];
          }
        }
      }
      groupSelection = groupSelection.filter(p => p.ID !== person.ID);

      if (person === undefined) {
        throw new Error('No more people to select from');
      }

      //const person = groupSelection.splice(0, 1)[0];
      randomizedData = randomizedData.filter(p => p.ID !== person.ID);

      group.push(person);

      groupSelection = groupSelection.filter(p => !p.Not.includes(person.ID));

      if (group.length === groupSize || randomizedData.length === 0) {
        // if (i + 1 % groupSize === 0) {

        group.forEach((per) => {
          per.Not.push(...group.map(p => p.ID));
        });

        const personServing = group[0];
        group.ServedAt = personServing.ID;
        personServing.Served = servingNumber;

        groups.push(group);
        groupSelection = randomizedData;
        //console.log(group);

        if (groupSize === 4 && (randomizedData.length) % 3 === 0) {
          groupSize = 3;
        }

        group = [];
      }
    }
    return groups;
  }



  return (
    <div className="App">
      <input type="file" accept=".csv" onChange={updateFile} />
      <input type="button" value="Upload" onClick={handleFileUpload} />
      <input type="button" value="Calculate" onClick={calculate} />
      <input type="button" value="Calculate" onClick={calculateMain} />
      {tables !== null && Object.keys(tables).map((table) => (
        [<h1>{table}</h1>,
        <table class="table">
          <thead>
            <tr class="table-secondary">
              {Object.keys(tables[table][0][0]).map((key) => (
                <th key={key}>{key}</th>
              ))
              }
            </tr>
          </thead>
          <tbody>
            {tables[table].map((groups, index) => ([
              <tr class="table-primary"><td colspan="5">Group {index + 1}</td></tr>,
              groups.map((row, index2) => (
                <tr key={index2}>
                  {Object.keys(row).map((value, index3) => (
                    <td key={index3}>{row[value]}</td>
                  ))}
                </tr>
              ))
            ]))}
          </tbody>
        </table>]
      )
      )}
      {fileContent && (
        <div>
          <h2>Uploaded File Content:</h2>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
