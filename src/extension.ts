'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, Position, Range, Selection, TextDocument, workspace, Uri } from 'vscode';
const path = require('path');

const prefix = 'markdown.extension.editing.';
var ignoreCharacters = [' ', '\t', '\n', '.', '!', '?', '#', '\r', ','];
var forbiddenWords = [''];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    commands.registerCommand('extension.capitalizeTitle', capitalizeTitle);
    commands.registerCommand('extension.capitalizeMarkDownTitles', capitalizeMDTitles);
}

function getForbiddenWords() {
    forbiddenWords.pop();
    let fileUri = Uri.file(path.join(__dirname, '../FirstUpperForbiddenWords.txt'));
    return workspace.openTextDocument(fileUri).then((document) => {
        for (var index = 0; index < document.lineCount; index++) {

            let text = document.lineAt(index).text;

            if (text.toLowerCase().charAt(0) != '*') {
                forbiddenWords.push(text);
            }
        }
    });
}

function capitalizeTitle() {
    if (forbiddenWords.length == 1) {
        getForbiddenWords().then(capitalizeFirstLetters);
    }
    else {
        capitalizeFirstLetters();
    }
}

function capitalizeMDTitles() {
    if (forbiddenWords.length == 1) {
        getForbiddenWords().then(capitalizeMDFirstLetters);
    }
    else {
        capitalizeMDFirstLetters();
    }
}

function capitalizeFirstLetters(line = null): string {
    let editor = window.activeTextEditor;
    let selection = editor.selection;
    let selectedText = editor.document.getText(selection);
    selectedText = selectedText.toLocaleLowerCase();

    let newLineOfText = "";
    let firstWord = true;
    let selectedTextArrayOfWords;
    
    if (line == null) {
        selectedTextArrayOfWords = selectedText.split(" ");
    }
    else
    {
        selectedTextArrayOfWords = line.split(" ");
    }
    
    selectedTextArrayOfWords.forEach((word) => {
        if ((firstWord || forbiddenWords.indexOf(word) == -1) && isOnlyAlpha(word)) {
            word = word[0].toLocaleUpperCase() + word.substr(1);
            firstWord = false;
        }
        
        newLineOfText += word + " ";
    });
    
    if (line == null) {
        replaceSelectionWith(selection, newLineOfText.trim());
        return newLineOfText.trim();
    }
    else {
        return newLineOfText.trim();
    }
}

function capitalizeMDFirstLetters() {
    let editor = window.activeTextEditor;
    let line = '';
    let numberOfLines = editor.document.lineCount;
    
    let lastLineLastCharacter = editor.document.lineAt(numberOfLines - 1).text.length;
    
    editor.selection = new Selection(new Position(0,0), new Position(numberOfLines - 1, lastLineLastCharacter));
    
    let listOfLines = editor.document.getText(editor.selection).split("\n");
    
    for (var i = 0; i < listOfLines.length; i++) {
        line = listOfLines[i];
        if (line[0] == "#") {
            listOfLines[i] = capitalizeFirstLetters(line) + "\n";
        }
        else if ((line[0] == '-' || line[0] == '=') && !isAlphaNumeric(line)) {
            listOfLines[i - 1] = capitalizeFirstLetters(listOfLines[i - 1]) + "\n";
        }
    }
    
    let newDocumentText = '';
    listOfLines.forEach((line) => {
        newDocumentText += line;
    });
    
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

function replaceSelectionWith(selection: Selection, newText: string) {
    let editor = window.activeTextEditor;
    editor.edit((edit) => {
        edit.replace(selection, newText);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}