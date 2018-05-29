/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import * as path  from 'path'

import {
  FileBox,
}             from 'file-box'

import {
  MessagePayload,
}                       from '../message'
import {
  ContactQueryFilter,
  ContactPayload,
}                       from '../contact'
import {
  RoomPayload,
  RoomQueryFilter,
}                       from '../room'
import {
  Puppet,
  PuppetOptions,
  Receiver,
}                       from '../puppet/'

import {
  log,
}                       from '../config'

export type PuppetFoodType = 'scan' | 'ding'
export type ScanFoodType   = 'scan' | 'login' | 'logout'

export class PuppetHostie extends Puppet {

  constructor(
    public options: PuppetOptions,
  ) {
    super(options)
  }

  public async start(): Promise<void> {
    log.verbose('PuppetMock', `start() with ${this.options.profile}`)

    this.state.on('pending')
    // await some tasks...
    this.state.on(true)

    this.userId = 'logined_user_id'
    const user = this.Contact.load(this.userId)
    this.emit('login', user)

    const msg  = this.Message.create('mock_id')
    await msg.ready()

    setInterval(() => {
      log.verbose('PuppetMock', `start() setInterval() pretending received a new message: ${msg + ''}`)
      this.emit('message', msg)
    }, 3000)

  }

  public async stop(): Promise<void> {
    log.verbose('PuppetMock', 'quit()')

    if (this.state.off()) {
      log.warn('PuppetMock', 'quit() is called on a OFF puppet. await ready(off) and return.')
      await this.state.ready('off')
      return
    }

    this.state.off('pending')
    // await some tasks...
    this.state.off(true)
  }

  public async logout(): Promise<void> {
    log.verbose('PuppetMock', 'logout()')

    if (!this.logonoff()) {
      throw new Error('logout before login?')
    }

    this.emit('logout', this.userId!) // becore we will throw above by logonoff() when this.user===undefined
    this.userId = undefined

    // TODO: do the logout job
  }

  /**
   *
   * Contact
   *
   */
  public contactAlias(contactId: string)                      : Promise<string>
  public contactAlias(contactId: string, alias: string | null): Promise<void>

  public async contactAlias(contactId: string, alias?: string|null): Promise<void | string> {
    log.verbose('PuppetMock', 'contactAlias(%s, %s)', contactId, alias)

    if (typeof alias === 'undefined') {
      return 'mock alias'
    }
    return
  }

  public async contactFindAll(query: ContactQueryFilter): Promise<string[]> {
    log.verbose('PuppetMock', 'contactFindAll(%s)', query)

    return []
  }

  public async contactAvatar(contactId: string): Promise<FileBox> {
    log.verbose('PuppetMock', 'contactAvatar(%s)', contactId)

    const WECHATY_ICON_PNG = path.resolve('../../docs/images/wechaty-icon.png')
    return FileBox.packLocal(WECHATY_ICON_PNG)
  }

  public async contactRawPayload(id: string): Promise<ContactPayload> {
    log.verbose('PuppetMock', 'contactRawPayload(%s)', id)
    const payload: ContactPayload = {
      name : 'mock name',
      gender: this.Contact.Gender.Unknown,
      type: this.Contact.Type.Unknown,
    }
    return payload
  }

  public async contactRawPayloadParser(rawPayload: ContactPayload): Promise<ContactPayload> {
    return rawPayload
  }

  /**
   *
   * Message
   *
   */
  public async messageRawPayload(id: string): Promise<MessagePayload> {
    log.verbose('PuppetMock', 'messageRawPayload(%s)', id)
    const payload: MessagePayload = {
      type: this.Message.Type.Unknown,
      date: new Date(),
      fromId : 'from_id',
      text : 'mock message text',
      toId   : 'to_id',
    }
    return payload
  }

  public async messageRawPayloadParser(payload: MessagePayload): Promise<MessagePayload> {
    return payload
  }

  public async messageSendText(
    receiver : Receiver,
    text     : string,
  ): Promise<void> {
    log.verbose('PuppetMock', 'messageSend(%s, %s)', receiver, text)
  }

  public async messageSendFile(
    receiver : Receiver,
    file     : FileBox,
  ): Promise<void> {
    log.verbose('PuppetMock', 'messageSend(%s, %s)', receiver, file)
  }

  public async messageForward(
    receiver  : Receiver,
    messageId : string,
  ): Promise<void> {
    log.verbose('PuppetMock', 'messageForward(%s, %s)',
                              receiver,
                              messageId,
              )
  }

  /**
   *
   * Room
   *
   */
  public async roomRawPayload(
    id: string,
  ): Promise<RoomPayload> {
    log.verbose('PuppetMock', 'roomRawPayload(%s)', id)

    const rawPayload: RoomPayload = {
      ownerId         : 'mock_room_owner_id',
      topic           : 'mock topic',
      memberIdList    : [],
      nameMap         : new Map<string, string>(),
      roomAliasMap    : new Map<string, string>(),
      contactAliasMap : new Map<string, string>(),
    }
    return rawPayload
  }

  public async roomRawPayloadParser(
    payload: RoomPayload,
  ): Promise<RoomPayload> {
    return payload
  }

  public async roomFindAll(
    query: RoomQueryFilter = { topic: /.*/ },
  ): Promise<string[]> {
    log.verbose('PuppetMock', 'roomFindAll(%s)', query)

    return []
  }

  public async roomDel(
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    log.verbose('PuppetMock', 'roomDel(%s, %s)', roomId, contactId)
  }

  public async roomAdd(
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    log.verbose('PuppetMock', 'roomAdd(%s, %s)', roomId, contactId)
  }

  public async roomTopic(
    roomId: string,
    topic?: string,
  ): Promise<void | string> {
    log.verbose('PuppetMock', 'roomTopic(%s, %s)', roomId, topic)

    if (typeof topic === 'undefined') {
      return 'mock room topic'
    }
    return
  }

  public async roomCreate(
    contactIdList : string[],
    topic         : string,
  ): Promise<string> {
    log.verbose('PuppetMock', 'roomCreate(%s, %s)', contactIdList, topic)

    return 'mock_room_id'
  }

  public async roomQuit(roomId: string): Promise<void> {
    log.verbose('PuppetMock', 'roomQuit(%s)', roomId)
  }

  /**
   *
   * FriendRequest
   *
   */
  public async friendRequestSend(
    contactId : string,
    hello     : string,
  ): Promise<void> {
    log.verbose('PuppetMock', 'friendRequestSend(%s, %s)', contactId, hello)
  }

  public async friendRequestAccept(
    contactId : string,
    ticket    : string,
  ): Promise<void> {
    log.verbose('PuppetMock', 'friendRequestAccept(%s, %s)', contactId, ticket)
  }

  public ding(data?: any): Promise<string> {
    return data
  }

}

export default PuppetHostie
