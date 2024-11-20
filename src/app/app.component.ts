import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentExample } from './dialog-content-example-dialog/dialog-content-example-dialog.component';
import { MatToolbar } from '@angular/material/toolbar';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatProgressBar, MatToolbar],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  files: File[] = [];
  zipFileBlob: Blob | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  folderName: string | null = null;
  isDragOver: boolean = false;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  onFileChange(event: any) {
    console.log("Files selected:", event.target.files);
    if (event.target.files.length > 0) {
      this.handleFiles(event.target.files);
    } else {
      console.log("No files selected.");
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  handleFiles(fileList: FileList) {
    this.files = Array.from(fileList);
    this.errorMessage = null;
    this.zipFileBlob = null;

    const firstFile = this.files[0];
    const fullPath = firstFile.webkitRelativePath || firstFile.name;
    const parts = fullPath.split('/');
    this.folderName = parts.length > 1 ? parts[0] : 'default';
  }

  removeFile(file: File) {
    const index = this.files.indexOf(file);
    if (index >= 0) {
      this.files.splice(index, 1);
    }
  }

  statusMessage: string | null = null;

  generateSwagger() {
    this.errorMessage = null;
    this.statusMessage = null;

    if (this.files.length === 0) {
      this.errorMessage = 'Nessuna cartella da processare per Swagger.';
      return;
    }

    const formData = new FormData();
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });
    // Usa la variabile d'ambiente per ottenere l'URL dinamico
    const apiUrl = environment.apiUrl;

    this.loading = true;
    this.statusMessage = 'Generazione in corso... Attendere. '+ apiUrl;


    this.http.post(`${apiUrl}/swagger`, formData, { responseType: 'blob' }).subscribe(
      (response) => {
        this.loading = false;
        this.errorMessage = null;
        this.zipFileBlob = response;
        this.statusMessage = 'Swagger generato con successo!';
      },
      (error) => {
        console.error('Errore durante l\'invio dei file:', error);
        this.loading = false;
        this.errorMessage = 'Errore durante la generazione di Swagger.';
        this.statusMessage = null;
      }
    );
  }

  downloadZip() {
    if (this.zipFileBlob) {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(this.zipFileBlob);

      const zipFilename = `${this.folderName || 'default'}_swagger.zip`;
      link.href = url;
      link.download = zipFilename;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  openDialog(): void {
    this.dialog.open(DialogContentExample);
  }
}
