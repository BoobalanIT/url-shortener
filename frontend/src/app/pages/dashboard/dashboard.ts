import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UrlService } from '../../services/url';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  user: any = {};
  urls: any[] = [];
  loading = false;
  error = '';
  success = '';

  // Create form
  originalUrl = '';
  shortCode = '';
  expiresAt = '';

  // Edit state
  editingCode: string | null = null;
  editUrl = '';
  editExpiry = '';
editCode = '';
 constructor(
    private auth: AuthService,
    private urlService: UrlService,
    private cdr: ChangeDetectorRef   // ← inject this
  ) {}
ngOnInit() {
  this.user = this.auth.getUser();

  // Small delay to ensure token is ready
  setTimeout(() => {
    this.loadUrls();
  }, 100);
}
 loadUrls() {
    this.urlService.getMyUrls().subscribe({
      next: (res: any) => {
        const raw = res?.data?.urls ?? res?.data ?? res;
        this.urls = Array.isArray(raw) ? raw : [raw];
        console.log('urls:', this.urls);
        this.cdr.detectChanges();   // ← force Angular to update the view
      },
      error: (err) => {
        console.log('error:', err);
        this.error = 'Failed to load URLs';
        this.cdr.detectChanges();
      }
    });
  }
  get totalClicks() {
    return this.urls.reduce((sum, u) => sum + u.clicks, 0);
  }

  get activeUrls() {
    return this.urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  }

  isExpired(url: any): boolean {
    return url.expiresAt && new Date(url.expiresAt) < new Date();
  }

  getShortUrl(code: string): string {
    return `http://localhost:5000/${code}`;
  }

  onSubmit() {
    if (!this.originalUrl || !this.shortCode) {
      this.error = 'Please fill in both URL and short code';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    const data: any = { originalUrl: this.originalUrl, shortCode: this.shortCode };
    if (this.expiresAt) data.expiresAt = this.expiresAt;

    this.urlService.shortenUrl(data).subscribe({
      next: () => {
        this.success = `Short link "${this.shortCode}" created!`;
        this.originalUrl = '';
        this.shortCode = '';
        this.expiresAt = '';
        this.loading = false;
        this.loadUrls();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create URL';
        this.loading = false;
      }
    });
  }

startEdit(url: any) {
  this.editingCode = url.shortCode;
  this.editUrl = url.originalUrl;
  this.editExpiry = url.expiresAt ? url.expiresAt.split('T')[0] : '';
  this.editCode = url.shortCode;  // ← add this
}

  saveEdit(code: string) {
    const data: any = {};
    if (this.editUrl) data.originalUrl = this.editUrl;
    if (this.editExpiry) data.expiresAt = this.editExpiry;
  if (this.editCode) data.shortCode = this.editCode;  // ← add this

    this.urlService.updateUrl(code, data).subscribe({
      next: () => {
        this.editingCode = null;
        this.success = 'Link updated!';
        this.loadUrls();
      },
      error: (err) => this.error = err.error?.message || 'Update failed'
    });
  }

  cancelEdit() {
    this.editingCode = null;
  }

  deleteUrl(code: string) {
    if (!confirm(`Delete "/${code}"?`)) return;
    this.urlService.deleteUrl(code).subscribe({
      next: () => {
        this.success = `"${code}" deleted!`;
        this.loadUrls();
      },
      error: () => this.error = 'Delete failed'
    });
  }

  copyUrl(code: string) {
    navigator.clipboard.writeText(this.getShortUrl(code));
    this.success = 'Link copied to clipboard!';
    setTimeout(() => this.success = '', 2000);
  }

  logout() { this.auth.logout(); }
}