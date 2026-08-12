import { StorageManagerRepository } from "./storage-manager.repository.js";
import type {
  CompanyLogoUploadPayload,
  StorageDownloadInput,
  StorageFolderPayload,
  StorageListInput,
  StorageUploadPayload
} from "./storage-manager.types.js";

export class StorageManagerService {
  constructor(private readonly repository = new StorageManagerRepository()) {}

  roots() {
    return this.repository.roots();
  }

  list(input: StorageListInput) {
    return this.repository.list(input);
  }

  createFolder(input: StorageFolderPayload) {
    return this.repository.createFolder(input);
  }

  upload(input: StorageUploadPayload) {
    return this.repository.upload(input);
  }

  uploadCompanyLogo(input: CompanyLogoUploadPayload) {
    return this.repository.uploadCompanyLogo(input);
  }

  readCompanyLogo(variant: "logo" | "logo-dark") {
    return this.repository.readCompanyLogo(variant);
  }

  download(input: StorageDownloadInput) {
    return this.repository.download(input);
  }
}
