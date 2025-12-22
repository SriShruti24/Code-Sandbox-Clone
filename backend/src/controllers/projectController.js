import util from 'util';
import  child_process from 'child_process';
import fs from 'fs/promises';
import uuid4 from 'uuid4';
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js';

const execPromisified=util.promisify(child_process.exec);

export const createProjectController=async(req,res)=>{

    //Create a uniqueid and then inside the projects folder create a folder with that id
    const  projectId=uuid4();
    console.log('New project id is',projectId);

    await fs.mkdir(`./projects/${projectId}`);
    //after this call the npm create vite command to create a vite project inside that folder

    const  response=await execPromisified(REACT_PROJECT_COMMAND,{
        cwd:`./projects/${projectId}`
    })
    return res.json({message:'Project created',data : projectId});

};
//core logic 