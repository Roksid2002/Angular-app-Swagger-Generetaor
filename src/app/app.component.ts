import {Component, TemplateRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatDialog} from '@angular/material/dialog';
import {
  DialogContentExample,
} from './dialog-content-example-dialog/dialog-content-example-dialog.component';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatProgressBar, MatToolbar],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  files: File[] = [];  // Per gestire i file caricati dall'utente
  zipFileBlob: Blob | null = null;  // Per memorizzare il file zip
  loading: boolean = false;  // Per visualizzare un indicatore di caricamento
  errorMessage: string | null = null;  // Messaggio di errore
  folderName: string | null = null;  // Variabile per il nome della cartella
  isDragOver: boolean = false;  // Per gestire lo stato del drag

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  // Funzione per gestire il caricamento dei file da una cartella
  onFileChange(event: any) {
    console.log("Files selected:", event.target.files);
    if (event.target.files.length > 0) {
      this.handleFiles(event.target.files);
    } else {
      console.log("No files selected.");
    }
  }

  // Funzione per gestire il drag-and-drop
  onDragOver(event: DragEvent) {
    event.preventDefault();  // Necessario per consentire il drop
    this.isDragOver = true;  // Cambia lo stato per visualizzare un feedback visivo
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;  // Reset dello stato quando i file escono dall'area
  }

  onDrop(event: DragEvent) {
    event.preventDefault();  // Previene il comportamento di default del browser (come aprire il file)
    this.isDragOver = false;  // Reset dello stato
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  // Funzione per gestire i file caricati (sia dal file input che dal drag-and-drop)
  handleFiles(fileList: FileList) {
    this.files = Array.from(fileList);
    this.errorMessage = null;  // Reset dell'errore
    this.zipFileBlob = null;   // Reset del file zip per nascondere il messaggio di successo

    // Estrai il nome della cartella dai file
    const firstFile = this.files[0];
    const fullPath = firstFile.webkitRelativePath || firstFile.name;  // Usa il percorso relativo se disponibile
    const parts = fullPath.split('/');  // Dividi il percorso in parti
    this.folderName = parts.length > 1 ? parts[0] : 'default';  // Imposta il nome della cartella
  }

  // Funzione per rimuovere un file dall'elenco dei file caricati
  removeFile(file: File) {
    const index = this.files.indexOf(file);
    if (index >= 0) {
      this.files.splice(index, 1);  // Rimuove il file dall'array
    }
  }

  // Variabile per gestire i messaggi di stato
  statusMessage: string | null = null;  // Messaggio di stato

  // Invia i file al backend e gestisce la risposta
  generateSwagger() {
    this.errorMessage = null;  // Reset dell'errore
    this.statusMessage = null;  // Reset del messaggio di stato

    if (this.files.length === 0) {
      this.errorMessage = 'Nessuna cartella da processare per Swagger.';
      return;
    }

    const formData = new FormData();
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    this.loading = true;  // Mostra l'indicatore di caricamento
    this.statusMessage = 'Generazione in corso... Attendere.';  // Imposta il messaggio di stato

    // Chiamata HTTP al server Flask per la generazione di Swagger
    this.http.post('http://127.0.0.1:5000/swagger', formData, { responseType: 'blob' }).subscribe(
      (response) => {
        this.loading = false;  // Nascondi l'indicatore di caricamento
        this.errorMessage = null;  // Reset dell'errore
        this.zipFileBlob = response;  // Memorizza il file zip come Blob
        this.statusMessage = 'Swagger generato con successo!';  // Aggiorna il messaggio di stato
      },
      (error) => {
        console.error('Errore durante l\'invio dei file:', error);
        this.loading = false;  // Nascondi l'indicatore di caricamento
        this.errorMessage = 'Errore durante la generazione di Swagger.';  // Mostra un messaggio di errore
        this.statusMessage = null;  // Reset del messaggio di stato
      }
    );
  }

  // Funzione per scaricare il file zip generato
  downloadZip() {
    if (this.zipFileBlob) {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(this.zipFileBlob);  // Crea un URL temporaneo per il file Blob

      // Utilizza il nome della cartella + "_swagger" come nome del file zip
      const zipFilename = `${this.folderName || 'default'}_swagger.zip`;
      link.href = url;
      link.download = zipFilename;  // Nome del file scaricato
      link.click();
      window.URL.revokeObjectURL(url);  // Libera l'URL temporaneo
    }
  }

  openDialog(): void {
    this.dialog.open(DialogContentExample);
  }
}
