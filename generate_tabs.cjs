const fs = require('fs');
const content = fs.readFileSync('src/components/Personnage/Monture/MonturePanel.tsx', 'utf8');

function generatePanel(typeUpper, typeLower) {
  let newContent = content
    .replace(/MonturePanel/g, typeUpper + 'Panel')
    .replace(/Montures/g, typeUpper + 's')
    .replace(/Monture/g, typeUpper)
    .replace(/montures/g, typeLower + 's')
    .replace(/monture/g, typeLower)
    .replace(/onMountsChange/g, 'on' + typeUpper + 'sChange')
    .replace(/mounts/g, typeLower + 's')
    .replace(/mount([^a-zA-Z])/g, typeLower + '$1')
    .replace(/MountToDelete/g, typeUpper + 'ToDelete')
    .replace(/mountToDelete/g, typeLower + 'ToDelete')
    .replace(/setMountToDelete/g, 'set' + typeUpper + 'ToDelete')
    .replace(/handleAddMount/g, 'handleAdd' + typeUpper)
    .replace(/handleRemoveMount/g, 'handleRemove' + typeUpper)
    .replace(/confirmRemoveMount/g, 'confirmRemove' + typeUpper)
    .replace(/handleMountChange/g, 'handle' + typeUpper + 'Change')
    .replace(/emptyMount/g, 'empty' + typeUpper);

  // Fix types from finding/replacing "Mount" and "mount" too aggressively
  // Our prop is generic so it replaced "Mount" with "Familier"
  newContent = newContent.replace(new RegExp(typeLower + '\\[\\]', 'g'), 'Mount[]');
  newContent = newContent.replace(new RegExp(typeLower + 's: ' + typeUpper, 'g'), typeLower + 's: Mount');
  newContent = newContent.replace(new RegExp('new' + typeUpper + 's: ' + typeUpper, 'g'), 'new' + typeUpper + 's: Mount');
  newContent = newContent.replace(new RegExp('Omit<' + typeUpper + ',', 'g'), 'Omit<Mount,');
  newContent = newContent.replace(new RegExp('keyof ' + typeUpper, 'g'), 'keyof Mount');
  newContent = newContent.replace(new RegExp('import \\{ ' + typeUpper + ' \\} from', 'g'), 'import { Mount } from');
  
  // Specific fix for empty definition 
  newContent = newContent.replace(new RegExp(typeUpper + ", 'uid'>", 'g'), "Mount, 'uid'>");
  // And fix mapping arg
  newContent = newContent.replace(new RegExp('keyof Mount\\]', 'g'), 'keyof Mount]');
  newContent = newContent.replace(new RegExp('\\(' + typeLower + ' \\| null', 'g'), '(string | null');
  
  return newContent;
}

fs.mkdirSync('src/components/Personnage/Familier', {recursive: true});
fs.writeFileSync('src/components/Personnage/Familier/FamiliersPanel.tsx', generatePanel('Familier', 'familier'));

fs.mkdirSync('src/components/Personnage/Invocation', {recursive: true});
fs.writeFileSync('src/components/Personnage/Invocation/InvocationsPanel.tsx', generatePanel('Invocation', 'invocation'));
