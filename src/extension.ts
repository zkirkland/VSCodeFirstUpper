'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

var forbiddenWords:string[] = [];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('extension.capitalizeTitle', capitalizeTitle);
    vscode.commands.registerCommand('extension.capitalizeMarkDownTitles', capitalizeMDTitles);
}

function getForbiddenWords() {
    forbiddenWords.pop();
    let fileUri = vscode.Uri.file(path.join(__dirname, '../data/FirstUpperForbiddenWords.txt'));
    return vscode.workspace.openTextDocument(fileUri).then((document) => {
        for (var index = 0; index < document.lineCount; index++) {

            let text = document.lineAt(index).text;

            if (text.toLowerCase().charAt(0) !== '*') {
                forbiddenWords.push(text);
            }
        }
    });
}

function capitalizeTitle() {
    if (forbiddenWords.length === 0) {
        getForbiddenWords().then(capitalizeFirstLettersOfSelection);
    }
    else {
        capitalizeFirstLettersOfSelection();
    }
}

function capitalizeMDTitles() {
    if (forbiddenWords.length === 0) {
        getForbiddenWords().then(capitalizeMDFirstLetters);
    }
    else {
        capitalizeMDFirstLetters();
    }
}

function capitalizeFirstLetters(line:string): string {
    let editor = vscode.window.activeTextEditor;

    if (!editor) { return ""; }

    let selectedTextArrayOfWords = line.split(" ");
    let firstWord = true;
    let newLineOfText = "";
    for (let index = 0; index < selectedTextArrayOfWords.length; index++) {
        const word = selectedTextArrayOfWords[index];

        let upperWord:string = "";
        if ((firstWord || forbiddenWords.indexOf(word) === -1) && isOnlyAlpha(word)) {
            upperWord = word[0].toLocaleUpperCase() + word.substr(1);
            firstWord = false;
            newLineOfText += index < selectedTextArrayOfWords.length - 1 ? upperWord + " " : upperWord;
        } else {
            newLineOfText += index < selectedTextArrayOfWords.length - 1 ? word + " " : word;
        }
    }
    
    return newLineOfText;
}

function capitalizeFirstLettersOfSelection(): string {
    let editor = vscode.window.activeTextEditor;

    if(!editor) { return ""; }

    let selection = editor.selection;
    let selectedText = editor.document.getText(selection);
    selectedText = selectedText.toLocaleLowerCase();

    let selectedTextArrayOfWords = selectedText.split(" ");
    let firstWord = true;
    let newLineOfText = "";
    for (let index = 0; index < selectedTextArrayOfWords.length; index++) {
        const word = selectedTextArrayOfWords[index];

        if ((firstWord || forbiddenWords.indexOf(word) === -1) && isOnlyAlpha(word)) {
            let upperWord = word[0].toLocaleUpperCase() + word.substr(1);
            firstWord = false;

            newLineOfText += index < selectedTextArrayOfWords.length - 1 ? upperWord + " " : upperWord;
        } else {
            newLineOfText += index < selectedTextArrayOfWords.length - 1 ? word + " " : word;
        }
    }
    
    replaceSelectionWith(selection, newLineOfText);
    return newLineOfText;
}

function capitalizeMDFirstLetters() {
    let editor = vscode.window.activeTextEditor;

    if (!editor) { return; }

    let line = '';
    let numberOfLines = editor.document.lineCount;
    
    let lastLineLastCharacter = editor.document.lineAt(numberOfLines - 1).text.length;
    
    editor.selection = new vscode.Selection(new vscode.Position(0,0), new vscode.Position(numberOfLines - 1, lastLineLastCharacter));
    
    let selectionText = editor.document.getText(editor.selection);
    let listOfLines = selectionText.split(/\r?\n/);
    
    for (var i = 0; i < listOfLines.length; i++) {
        line = listOfLines[i];
        if (line[0] === "#") {
            listOfLines[i] = capitalizeFirstLetters(line);
        }
        else if ((line[0] === '-' || line[0] === '=') && !isAlphaNumeric(line)) {
            listOfLines[i - 1] = capitalizeFirstLetters(listOfLines[i - 1]);
        }
    }
    
    let newDocumentText = listOfLines.join("\r\n");
    
    replaceSelectionWith(editor.selection, newDocumentText);
}

function isAlphaNumeric(line: string): boolean {
    let rg = RegExp("[a-zA-Z0-9]+");
    return rg.test(line);
}

function isOnlyAlpha(line: string): boolean {
    let rg = RegExp("[a-zA-Z]+");
    return rg.test(line);
}

function replaceSelectionWith(selection: vscode.Selection, newText: string) {
    let editor = vscode.window.activeTextEditor;
    
    if (!editor) { return; }

    editor.edit((edit) => {
        edit.replace(selection, newText);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}
