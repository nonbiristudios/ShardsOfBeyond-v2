let artworks;
const medals = ['🏅','🥈','🥉'];
let table;

const createURL = (id, index) => `https://cdn.midjourney.com/${id}/0_${index}.png`;
let votes = {};
let codeField;

document.addEventListener('DOMContentLoaded', async () => {
  data = await fetch('artworks.json');
  artworks = await data.json();
  table = document.getElementById('entries');
  codeField  = document.getElementById('codeInput');

  update();
});

const update = () => {
  // Populate names
  Object.entries(artworks).forEach(([name, images]) => {
    if(images.length <= 1) return;

    images = images.map((image) => 
      `<div class="imageEntry" id="entry-${image.id}_${image.index}">
        <img class="prevent-drag" src=${createURL(image.id, image.index)}>
        <div class="medal">
          <center>
            <div class="btn-group btn-group-toggle">
              ${medals.map((medal, i) => {
                if(medal === 'c') return '';
                const imageId = `${image.id}_${image.index}_${i}`;
                const event = {
                  ...image,
                  medal: i
                };

                return `
                  <label class="btn btn-primary">
                    <input 
                      onclick="updateSelection('${name}', '${btoa(JSON.stringify(event))}')"
                      type="radio"
                      name="options-${name}-${i}"
                      id="${imageId}"
                    >
                    ${medal}
                  </label>
                `;
              }).join('\n')}
            </div>
          </center>
        </div>
      </div>
    `);

    table.insertAdjacentHTML('beforeend', 
      `<li class="list-group-item">
        <div class="entry" id="entry-${name}">
          <div class="name" onclick="toggleImageRow(event)">
            ${name}
          </div>
          <div class="imageRow collapsing">
            <div class="border">
              ${images.join('\n')}
            </div>
          </div>
        </div>
      </li>`);
  });
}

const toggleImageRow = (e) => {
  const imageRow = e.srcElement.parentElement.querySelector(".imageRow");

  if(imageRow.classList.contains('collapsing')) {
    imageRow.classList.remove('collapsing');
  } else {
    imageRow.classList.add('collapsing');
  }
}

const updateSelection = (name, selection) => {
  selection = JSON.parse(atob(selection));

  // Disable all other selections on that image.
  const otherMedals = [0, 1, 2];
  otherMedals.splice(selection.medal, 1);

  otherMedals.forEach((medal) => {
    const el = document.getElementById(`${selection.id}_${selection.index}_${medal}`);
    if(el.checked) {
      el.checked = false;
      // Remove from data, too.
      delete votes[name][medal];
    }
  });

  // Save information about selection.
  votes[name] = votes[name] ?? {};
  votes[name][selection.medal] = `${selection.id}_${selection.index}`;
  votes[name].c = Object.keys(artworks[name]).length;

  console.log(votes);

  updateCorrectness(name);
};

const updateCode = () => {
  const code = btoa(JSON.stringify(votes));
  codeField.value = code;
};

const codeChanged = () => {
  let json;
  let obj;

  // Try to parse
  try {
    json = atob(codeField.value);
    obj = JSON.parse(json);
  } catch {
    codeField.classList.remove('done');
    codeField.classList.add('wrong');
    return;
  }

  codeField.classList.remove('wrong');

  votes = obj;
  // Populate all fields
  Object.entries(obj).forEach(([name, artworks]) => {
    Object.entries(artworks).forEach(([medal, image]) => {
      if(medal === 'c') return;

      const box = document.getElementById(`${image}_${medal}`);
      box.checked = true;
    });
    updateCorrectness(name);
  });
}

const updateCorrectness = (name) => {
  // Update marking of title.
  const el = document.getElementById(`entry-${name}`);

  if(votes[name] !== undefined) {
    const givenMedals = Object.entries(votes[name] ?? {}).length-1;
    if(givenMedals === 3 || givenMedals === Object.keys(artworks[name]).length) {
      el.classList.remove('wrong');
      el.classList.add('done');
      
      updateCode();
      codeField.classList.remove('wrong');
    } else {
      el.classList.remove('done');
      el.classList.add('wrong');
    }
  }
};