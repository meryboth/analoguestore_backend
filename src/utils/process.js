// /utils/process.js
import { Command } from 'commander';

const program = new Command();

program
  .option('-m, --mode <mode>', 'Modo de ejecución', 'desarrollo') // Default es desarrollo
  .parse(process.argv);

export default program;
