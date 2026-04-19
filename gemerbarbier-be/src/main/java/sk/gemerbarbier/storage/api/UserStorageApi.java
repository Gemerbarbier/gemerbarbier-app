package sk.gemerbarbier.storage.api;

import sk.gemerbarbier.entity.User;

public interface UserStorageApi {

  User getUser(String username);
}
