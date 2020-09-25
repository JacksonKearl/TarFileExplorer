TAR File Explorer
=================

An HTML/JavaScript application that allows the user to upload a TAR file, view, add, download, or remove the files contained within it, and then download the modified archive.

### This Fork

Forked to imporove perf and better support distribution as a single file incorporated into a larger appication. This included:
- Removing all rendering code
- Removing all tar writing code
- Removing additions to global prototype objects
- Moving to Uint8Array for bytearrays
- Reducing allocations in reads (the TarFile object is a collection of slices into the original Uint8Array)
- Several bug fixes
- Packaging to expose only a single function for creating a TarFile from a Uint8Array
- Linting tooling and several vscode hooks
