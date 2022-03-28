#!/usr/bin/env node
import {readFileSync, existsSync, writeFileSync} from 'fs';
import { exit } from 'process';
import { execSync } from 'child_process';

function usage( message, exitCode ) {
    console.log( message );
    console.log( `Usage: npm run version [patch | minor | major]`);
    console.log( 'Usage: npm run version <versionString>');
    exit(exitCode);
}

const appInfoFilePath = 'static/app-info.json';
const packageFilePath = 'package.json';

//POSIX error codes typically defined in errno.h
const eNoEnt = 2;
const eInval = 22;
const Success = 0;

if(! existsSync(packageFilePath) ) {
    usage(`${packageFilePath} NOT FOUND. Version not generated.`, eNoEnt);
    exit(eNoEnt);
}

const numArgs = process.argv.length;
if( numArgs >  2 ) {
    const arg = process.argv[numArgs-1].toLowerCase();
    const validArgs = ['help', 'patch', 'minor', 'major', 'version'];
    if( !validArgs.includes(arg) ) {
        usage( `ERROR: invalid argument "${arg}"`, eInval);
    }
    if( arg == 'help') {
        usage('', 0);
    }
    if( arg == 'version' ) {
        if( numArgs != 4 ) {
            usage( `ERROR: invalid argument "${arg}" expecting ${arg} <versionString>`, eInval);
        }
        // set the version number explicitly to the value provided
        execSync(`npm version ${process.argv[3]}`);
    }
    else {
        // bump the patch, minor or major version number
        execSync(`npm version ${arg}`);
    }

}
// get the version number from the package.json file
const pkg = JSON.parse(readFileSync(packageFilePath));
const pkgVersion = pkg.version;
const pkgName = pkg.name;


// if the generated app info file already exists
if( existsSync(appInfoFilePath) ) {
    const appInfo = JSON.parse(readFileSync(appInfoFilePath));
    // see if the existing app info file is different than what is in the package.json file
    if( (appInfo.appVersion != pkgVersion) || (appInfo.appName != pkgName) ) {
        // create app info json file that contains the app name and version number.
        writeFileSync(appInfoFilePath, JSON.stringify({appName: pkgName, appVersion: pkgVersion}));
    }
}
else {
    // create app info json file that contains the app name and version number.
    writeFileSync(appInfoFilePath, JSON.stringify({appName: pkgName, appVersion: pkgVersion}));
}

// SUCCESS
exit(Success);
