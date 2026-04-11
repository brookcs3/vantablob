const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const handlePointerLeave = \(\) => {([\s\S]*?)};/g, (match, p1) => {
  return `const handlePointerLeave = () => {${p1}      controller.resetPointer();\n    };`;
});

code = code.replace(/window\.addEventListener\('pointermove', handlePointerMove\);/g, "containerRef.current.addEventListener('pointermove', handlePointerMove);");
code = code.replace(/window\.addEventListener\('pointerdown', handlePointerDown\);/g, "containerRef.current.addEventListener('pointerdown', handlePointerDown);");
code = code.replace(/window\.addEventListener\('pointerleave', handlePointerLeave\);/g, "containerRef.current.addEventListener('pointerleave', handlePointerLeave);");

code = code.replace(/window\.removeEventListener\('pointermove', handlePointerMove\);/g, "containerRef.current?.removeEventListener('pointermove', handlePointerMove);");
code = code.replace(/window\.removeEventListener\('pointerdown', handlePointerDown\);/g, "containerRef.current?.removeEventListener('pointerdown', handlePointerDown);");
code = code.replace(/window\.removeEventListener\('pointerleave', handlePointerLeave\);/g, "containerRef.current?.removeEventListener('pointerleave', handlePointerLeave);");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
